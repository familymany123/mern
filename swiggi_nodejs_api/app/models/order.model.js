const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  code: { type: String, required: true },  // Mã đơn hàng
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },  // Liên kết với người dùng
  address: { type: String, required: true },  // Địa chỉ giao hàng
  phone: { type: String, required: true },  // Số điện thoại
  amount: { type: Number, required: true },  // Tổng tiền đơn hàng
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'coupons' },  // Liên kết với mã giảm giá (có thể không bắt buộc)
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },  // Trạng thái đơn hàng
  ship: { type: Number, required: true },  // Tổng tiền ship
  distance: { type: String, required: true },  // Quãng đường ship (KM)
  timeShip: { type: String, required: true },  // Thời gian ship (KM)
  payment: { type: String, enum: ['Cod', 'Bank'], default: 'Cod' }, // Phương thức thanh toán
  created_at: { type: Date, default: Date.now },  // Thời gian tạo
  updated_at: { type: Date, default: Date.now }  // Thời gian cập nhật
});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
