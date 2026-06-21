const Order = require("../models/order.model");
const DetailOrder = require("../models/detail_orders.model");
const Cart = require("../models/cart.model");
const Coupon = require("../models/coupon.model");
const recommenderService = require("../services/recommender.service");

const VIETQR_EXPIRY_MS = 10 * 60 * 1000;

async function expireStaleVietQrOrders() {
  await Order.updateMany(
    {
      payment: "Bank",
      paymentStatus: "Pending",
      status: "Pending",
      paymentExpiresAt: { $lte: new Date() },
    },
    {
      $set: {
        paymentStatus: "Expired",
        status: "Cancelled",
        updated_at: new Date(),
      },
    }
  );
}

function getVietQrConfig() {
  return {
    bankId: process.env.BANK_ID?.trim(),
    accountNo: process.env.BANK_ACCOUNT_NO?.trim(),
    accountName: process.env.BANK_ACCOUNT_NAME?.trim(),
    template: process.env.VIETQR_TEMPLATE?.trim() || "compact2",
  };
}

function buildVietQrPayment(order, config) {
  const amount = order.amount + (order.ship || 0);
  const query = new URLSearchParams({
    amount: String(amount),
    addInfo: order.code,
    accountName: config.accountName,
  });
  const bankId = encodeURIComponent(config.bankId);
  const accountNo = encodeURIComponent(config.accountNo);
  const template = encodeURIComponent(config.template);

  return {
    provider: "VietQR",
    bankId: config.bankId,
    accountNo: config.accountNo,
    accountName: config.accountName,
    amount,
    content: order.code,
    expiresAt: order.paymentExpiresAt,
    qrUrl: `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${query.toString()}`,
  };
}

async function learnRecommendationsSafely(orderId) {
  try {
    await recommenderService.learnFromOrder(orderId);
  } catch (error) {
    console.error("Recommendation learning failed:", error);
  }
}

class OrderController {
  // [GET] /orders
  async index(req, res) {
    try {
      await expireStaleVietQrOrders();

      const { page = 1, limit = 10, search = "" } = req.query;
      const query = {};

      if (req.user.role === "admin") {
        if (search) {
          query.code = { $regex: search, $options: "i" };
        }
      } else {
        query.user = req.user.userId;
      }

      const orders = await Order.find(query)
        .populate({
          path: "coupon",
          select: "value",
          options: { lean: true },
        })
        .populate("user")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ created_at: -1 });

      const totalOrders = await Order.countDocuments(query);

      const formattedOrders = orders.map((order) => ({
        ...order.toObject(),
        coupon: order.coupon ? order.coupon : "Không sử dụng",
      }));

      return res.json({
        orders: formattedOrders,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi lấy danh sách đơn hàng",
        error,
      });
    }
  }

  async delivered(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      if (
        order.user.toString() !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }

      if (order.status !== "Processing") {
        return res.status(400).json({
          message: "Chỉ đơn hàng đang xử lý mới có thể hoàn thành giao hàng",
        });
      }

      order.status = "Completed";
      const savedOrder = await order.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("orderStatusUpdated", savedOrder);
      }

      learnRecommendationsSafely(savedOrder._id);

      return res.status(200).json({
        message: "Đơn hàng đã được giao thành công",
        order: savedOrder,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi cập nhật giao hàng thành công",
        error,
      });
    }
  }

  // [POST] /orders/
  async create(req, res) {
    try {
      const {
        address,
        phone,
        coupon,
        ship = 8000,
        distance,
        timeShip,
        payment = "Cod",
      } = req.body;

      if (!["Cod", "Bank"].includes(payment)) {
        return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
      }

      const vietQrConfig = payment === "Bank" ? getVietQrConfig() : null;
      if (
        vietQrConfig &&
        (!vietQrConfig.bankId ||
          !vietQrConfig.accountNo ||
          !vietQrConfig.accountName)
      ) {
        return res.status(500).json({
          message: "Chưa cấu hình đầy đủ tài khoản nhận tiền VietQR",
        });
      }

      const carts = await Cart.find({ user: req.user.userId })
        .populate("food")
        .populate("toppings");

      if (!carts.length) {
        return res.status(404).json({ message: "Giỏ hàng hiện đang trống" });
      }

      let totalAmount = carts.reduce((total, cartItem) => {
        const foodPrice = cartItem.food.price;
        const toppingsPrice = cartItem.toppings.reduce(
          (toppingTotal, topping) => toppingTotal + topping.price,
          0
        );

        return total + (foodPrice + toppingsPrice) * cartItem.quantity;
      }, 0);

      let couponCheck = null;

      if (coupon) {
        couponCheck = await Coupon.findOne({ code: coupon.trim().toUpperCase() });

        if (!couponCheck) {
          return res.status(400).json({ message: "Mã giảm giá không hợp lệ" });
        }

        if (new Date(couponCheck.expiry_date) < new Date()) {
          return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
        }

        if (couponCheck.quantity <= 0) {
          return res
            .status(400)
            .json({ message: "Mã giảm giá đã hết số lượng" });
        }

        const discountAmount = totalAmount * (couponCheck.value / 100);
        totalAmount -= discountAmount;

        if (totalAmount < 0) {
          totalAmount = 0;
        }

        couponCheck.quantity -= 1;
        await couponCheck.save();
      }

      const order = new Order({
        user: req.user.userId,
        code: `ORD${Date.now()}`,
        address,
        phone,
        amount: totalAmount,
        coupon: couponCheck ? couponCheck._id : null,
        status: "Pending",
        ship,
        distance,
        timeShip,
        payment,
        paymentStatus: payment === "Bank" ? "Pending" : "NotRequired",
        paymentExpiresAt:
          payment === "Bank"
            ? new Date(Date.now() + VIETQR_EXPIRY_MS)
            : null,
      });

      // Lưu đơn hàng
      const savedOrder = await order.save();

      // Tạo chi tiết đơn hàng từ giỏ hàng
      const detailOrders = carts.map((cartItem) => ({
        order: savedOrder._id,
        food: cartItem.food._id,
        toppings: cartItem.toppings.map((topping) => topping._id),
        quantity: cartItem.quantity,
      }));

      await DetailOrder.insertMany(detailOrders);

      await Cart.deleteMany({ user: req.user.userId });

      // Realtime: báo admin có đơn mới
      const io = req.app.get("io");
      if (io) {
        io.emit("newOrder", savedOrder);
      }

      learnRecommendationsSafely(savedOrder._id);

      const paymentInfo =
        payment === "Bank"
          ? buildVietQrPayment(savedOrder, vietQrConfig)
          : null;

      return res.status(201).json({
        message: "Đơn hàng đã được tạo thành công",
        order: savedOrder,
        paymentInfo,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi tạo đơn hàng",
        error,
      });
    }
  }

  // [GET] /orders/:id
  async show(req, res) {
    try {
      await expireStaleVietQrOrders();

      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      if (order.user._id != req.user.userId && req.user.role != "admin") {
        return res
          .status(400)
          .json({ message: "Bạn không được phép xem đơn hàng này" });
      }

      const detailOrders = await DetailOrder.find({ order: id })
        .populate("food")
        .populate("toppings");

      return res.json({ order, detailOrders });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi lấy chi tiết đơn hàng",
        error,
      });
    }
  }

  // [PATCH] /orders/:id/cancel
  async cancel(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      if (order.user._id != req.user.userId && req.user.role != "admin") {
        return res.status(400).json({
          message: "Bạn không được phép thực hiện hủy đơn hàng này",
        });
      }

      if (order.status === "Cancelled") {
        return res.status(400).json({
          message: "Đơn hàng đã bị hủy trước đó",
        });
      }

      if (order.status === "Completed") {
        return res.status(400).json({
          message: "Không thể hủy đơn hàng đã hoàn thành",
        });
      }

      order.status = "Cancelled";
      if (order.payment === "Bank" && order.paymentStatus === "Pending") {
        order.paymentStatus = "Cancelled";
      }
      const savedOrder = await order.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("orderStatusUpdated", savedOrder);
      }

      return res.status(200).json({
        message: "Đơn hàng đã được hủy thành công",
        order: savedOrder,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi hủy đơn hàng",
        error,
      });
    }
  }

  // [PATCH] /orders/:id/expire-payment
  async expirePayment(req, res) {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      if (
        order.user.toString() !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }

      if (
        order.payment !== "Bank" ||
        order.paymentStatus !== "Pending" ||
        order.status !== "Pending"
      ) {
        return res.json({ order });
      }

      if (
        order.paymentExpiresAt &&
        order.paymentExpiresAt.getTime() > Date.now()
      ) {
        return res.status(400).json({ message: "Thanh toán chưa hết hạn" });
      }

      order.paymentStatus = "Expired";
      order.status = "Cancelled";
      order.updated_at = new Date();
      const savedOrder = await order.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("orderStatusUpdated", savedOrder);
      }

      return res.json({
        message: "Thanh toán VietQR đã hết hạn",
        order: savedOrder,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi cập nhật hạn thanh toán",
        error,
      });
    }
  }

  // [PATCH] /orders/:id/status
  async status(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["Pending", "Processing", "Completed"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      if (
        order.payment === "Bank" &&
        order.paymentStatus === "Pending" &&
        order.paymentExpiresAt &&
        order.paymentExpiresAt.getTime() <= Date.now()
      ) {
        order.paymentStatus = "Expired";
        order.status = "Cancelled";
        order.updated_at = new Date();
        const expiredOrder = await order.save();

        const io = req.app.get("io");
        if (io) {
          io.emit("orderStatusUpdated", expiredOrder);
        }

        return res.status(400).json({
          message: "Thanh toán VietQR đã hết hạn",
          order: expiredOrder,
        });
      }

      if (order.status === "Cancelled") {
        return res.status(400).json({
          message: "Không thể cập nhật trạng thái đơn hàng đã hủy",
        });
      }

      if (order.status === "Completed") {
        return res.status(400).json({
          message: "Không thể cập nhật trạng thái đơn hàng đã hoàn thành",
        });
      }

      const allowedTransitions = {
        Pending: ["Processing"],
        Processing: ["Completed"],
      };

      if (!allowedTransitions[order.status]?.includes(status)) {
        return res.status(400).json({
          message: `Không thể chuyển trạng thái từ ${order.status} sang ${status}`,
        });
      }

      order.status = status;
      if (
        status === "Processing" &&
        order.payment === "Bank" &&
        order.paymentStatus === "Pending"
      ) {
        order.paymentStatus = "Paid";
      }
      order.updated_at = new Date();
      const savedOrder = await order.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("orderStatusUpdated", savedOrder);
      }

      learnRecommendationsSafely(savedOrder._id);

      return res.status(200).json({
        message: "Trạng thái đơn hàng đã được cập nhật thành công",
        order: savedOrder,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi khi cập nhật trạng thái đơn hàng",
        error,
      });
    }
  }

}

module.exports = new OrderController();
