const Order = require("../models/order.model");
const DetailOrder = require("../models/detail_orders.model");
const Cart = require("../models/cart.model");
const Coupon = require("../models/coupon.model");
const { VNPay } = require("vnpay");
const vnpayConfig = require("../config/vnpay");
const recommenderService = require("../services/recommender.service");

function formatVnpayDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
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

      return res.status(201).json({
        message: "Đơn hàng đã được tạo thành công",
        order: savedOrder,
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

  async vnpay(req, res) {
    try {
      const { coupon, ship, distance, timeShip, address, phone } = req.body;
      const orderAmount = Number(req.body.amount);
      const shippingFee = Number(ship || 0);

      if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
        return res.status(400).json({
          code: "01",
          message: "So tien thanh toan khong hop le",
        });
      }

      const forwardedFor = req.headers["x-forwarded-for"];
      var ipAddr = (
        Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor?.split(",")[0]
      ) || req.socket.remoteAddress || req.connection.remoteAddress;
      ipAddr = String(ipAddr || "").replace(/^::ffff:/, "").trim();

      const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } =
        vnpayConfig;

      var tmnCode = vnp_TmnCode;
      var secretKey = vnp_HashSecret;
      const paymentEndpoint = new URL(vnp_Url);

      const returnParams = new URLSearchParams({
        coupon: coupon || "",
        ship: String(shippingFee),
        distance: distance || "",
        timeShip: timeShip || "",
        address: address || "",
        phone: phone || "",
      });
      var returnUrl = `${vnp_ReturnUrl}?${returnParams.toString()}`;

      var date = new Date();

      var createDate = Number(formatVnpayDate(date));

      var expireDate = new Date(date);
      expireDate.setMinutes(expireDate.getMinutes() + 15);

      var vnp_ExpireDate = Number(formatVnpayDate(expireDate));
      var orderId = formatVnpayDate(date);

      var amount = Math.round(orderAmount + shippingFee);
      var locale = req.body.language;
      if (locale === null || locale === "") {
        locale = "vn";
      }

      const vnpay = new VNPay({
        tmnCode,
        secureSecret: secretKey,
        vnpayHost: paymentEndpoint.origin,
        testMode: paymentEndpoint.hostname === "sandbox.vnpayment.vn",
        hashAlgorithm: "SHA512",
        enableLog: false,
        endpoints: {
          paymentEndpoint: paymentEndpoint.pathname.replace(/^\/+/, ""),
        },
      });

      const paymentData = {
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr,
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: "thanh toan vnpay",
        vnp_Locale: locale,
        vnp_CreateDate: createDate,
        vnp_ExpireDate,
      };

      const vnpUrl = vnpay.buildPaymentUrl(paymentData);

      return res.status(200).json({
        code: "00",
        message: "Success",
        data: vnpUrl,
      });
    } catch (error) {
      console.error("VNPay Error:", error);

      return res.status(500).json({
        code: "99",
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = new OrderController();
