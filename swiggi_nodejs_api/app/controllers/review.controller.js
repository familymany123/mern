const Review = require('../models/review.model'); // Model Review
const Order = require('../models/order.model'); // Model Order
const DetailOrder = require('../models/detail_orders.model'); // Model DetailOrder
const mongoose = require('mongoose');

const reviewController = {
  // Phương thức tạo đánh giá
  async create(req, res) {
    try {
      const { foodId, star, content } = req.body;

      const { userId } = req.user

      // Kiểm tra userId và foodId hợp lệ
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({ message: 'Món ăn không tồn tại' });
      }

      // Kiểm tra người dùng đã mua sản phẩm này hay chưa
      const hasPurchased = await DetailOrder.exists({
        food: foodId,
        order: {
          $in: await Order.find({ user: userId }).distinct('_id'), // Lấy danh sách order của user
        },
      });

      if (!hasPurchased) {
        return res.status(400).json({ message: 'Bạn chỉ được đánh giá khi đã mua món ăn này mới được đánh giá.' });
      }

      // Tạo đánh giá
      const review = new Review({
        food: foodId,
        user: userId,
        star,
        content,
      });

      await review.save();
      return res.status(201).json({ message: 'Đánh giá thành công!', review });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server', error });
    }
  },

  // Phương thức lấy danh sách đánh giá và tổng số đánh giá
  async index(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra productId hợp lệ
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Món ăn không tồn tại' });
      }

      // Lấy danh sách đánh giá
      const reviews = await Review.find({ 'food': id })
        .populate('user', 'fullname') // Lấy thông tin user (ví dụ: name)
        .sort({ created_at: -1 }); // Sắp xếp theo thời gian mới nhất

      // Tính tổng số đánh giá và điểm trung bình
      const totalReviews = reviews.length;
      const avgStar =
        totalReviews > 0
          ? (reviews.reduce((sum, review) => sum + review.star, 0) / totalReviews).toFixed(2)
          : 0;

      return res.status(200).json({
        totalReviews,
        avgStar,
        reviews,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server', error });
    }
  },
};

module.exports = reviewController;
