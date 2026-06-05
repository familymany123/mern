const mongoose = require('mongoose');

const detailOrderSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },  // Liên kết với bảng orders
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },  // Liên kết với bảng foods
  toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'toppings' }],  // Liên kết với bảng toppings (có thể chứa nhiều topping)
  quantity: { type: Number, required: true, min: 1 },  // Số lượng sản phẩm trong đơn hàng
  created_at: { type: Date, default: Date.now },  // Thời gian tạo
  updated_at: { type: Date, default: Date.now }  // Thời gian cập nhật
});

const DetailOrder = mongoose.model('detail_orders', detailOrderSchema);

module.exports = DetailOrder;
