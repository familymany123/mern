const Topping = require("../models/topping.model.js");
const FoodTopping = require("../models/foodTopping.model.js");
const Cart = require("../models/cart.model.js");
const DetailOrder = require("../models/detail_orders.model.js");

class ToppingController {

  // [GET] /toppings
  async index(req, res) {
    try {
      const { page = 1, limit = 10, name = '' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Validate page và limit phải là số nguyên dương
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Tìm kiếm các topping theo tên (nếu có)
      const queryCondition = name ? { name: new RegExp(name, 'i') } : {};

      const toppings = await Topping.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .exec();

      const count = await Topping.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      return res.json({
        toppings,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/toppings?page=${pageNum + 1}&limit=${limitNum}&name=${name}` : null,
        prev: pageNum > 1 ? `/toppings?page=${pageNum - 1}&limit=${limitNum}&name=${name}` : null
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh sách topping', error });
    }
  }

  // [GET] /toppings/:id
  async show(req, res) {
    try {
      const topping = await Topping.findById(req.params.id);
      if (!topping) {
        return res.status(404).json({ message: 'Không tìm thấy topping' });
      }
      return res.json(topping);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất topping', error });
    }
  }

  // [POST] /toppings
  async create(req, res) {
    try {
      const { name, price } = req.body;

      // Validate các trường name và price
      if (!name || !price) {
        return res.status(400).json({ message: 'Tên và giá là bắt buộc.' });
      }

      // Kiểm tra nếu price không phải là số hoặc nhỏ hơn 0
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Giá phải là một số lớn hơn hoặc bằng 0.' });
      }

      const topping = new Topping({ name, price });
      await topping.save();

      return res.status(201).json({ message: 'Tạo topping thành công', topping });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo topping', error });
    }
  }

  // [PUT] /toppings/:id
  async update(req, res) {
    try {
      const { name, price } = req.body;

      // Validate các trường name và price
      if (!name || !price) {
        return res.status(400).json({ message: 'Tên và giá là bắt buộc.' });
      }

      // Kiểm tra nếu price không phải là số hoặc nhỏ hơn 0
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Giá phải là một số lớn hơn hoặc bằng 0.' });
      }

      const topping = await Topping.findByIdAndUpdate(req.params.id, { name, price }, { new: true });
      if (!topping) {
        return res.status(404).json({ message: 'Không tìm thấy topping' });
      }

      return res.json({ message: 'Cập nhật topping thành công', topping });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật topping', error });
    }
  }

  // [DELETE] /toppings/:id
  async delete(req, res) {
    try {
      const topping = await Topping.findByIdAndDelete(req.params.id);
      if (!topping) {
        return res.status(404).json({ message: 'Không tìm thấy topping' });
      }

      await FoodTopping.deleteMany({ topping: topping._id });
      await Cart.updateMany({}, { $pull: { toppings: topping._id } });
      await DetailOrder.updateMany({}, { $pull: { toppings: topping._id } });

      return res.json({ message: 'Xóa topping thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa topping', error });
    }
  }
}

module.exports = new ToppingController();
