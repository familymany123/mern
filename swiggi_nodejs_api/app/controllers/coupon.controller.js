const Coupon = require("../models/coupon.model.js");

class CouponController {

  // [GET] /coupons
  async index(req, res) {
    try {
      const { page = 1, limit = 10, code } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Điều kiện tìm kiếm
      const queryCondition = {
        expiry_date: { $gt: new Date() },
    quantity: { $gt: 0 }
      };
      if (code) {
        queryCondition.code = new RegExp(code, 'i'); // Tìm kiếm không phân biệt chữ hoa chữ thường
      }

      const coupons = await Coupon.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .exec();

      const count = await Coupon.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      return res.json({
        coupons,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/coupons?page=${pageNum + 1}&limit=${limitNum}${code ? `&code=${code}` : ''}` : null,
        prev: pageNum > 1 ? `/coupons?page=${pageNum - 1}&limit=${limitNum}${code ? `&code=${code}` : ''}` : null
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh sách coupon', error });
    }
  }

  // [GET] /coupons/:id
  async show(req, res) {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Không tìm thấy coupon' });
      }
      return res.json(coupon);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất coupon', error });
    }
  }

  // [POST] /coupons
  async create(req, res) {
    try {
      let { code, description, value, quantity, expiry_date } = req.body;

      // Validate các trường
      if (!code || !value || !quantity || !expiry_date) {
        return res.status(400).json({ message: 'Code, giá trị, số lượng và ngày hết hạn là bắt buộc.' });
      }

      if (isNaN(value) || value < 1 || value > 100) {
        return res.status(400).json({ message: 'Gi� tr? gi?m ph?i t? 1 d?n 100.' });
      }

      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Số lượng phải là một số lớn hơn hoặc bằng 0.' });
      }

      const now = new Date();
      const expiryDate = new Date(expiry_date);

      if (expiryDate <= now) {
        return res.status(400).json({ message: 'Ngày hết hạn phải lớn hơn ngày hiện tại.' });
      }

      code = code.trim().toUpperCase();

      if (await Coupon.findOne({ code })) {
        return res.status(400).json({ message: 'Ma giam gia da ton tai.' });
      }

      const coupon = new Coupon({ code, description, value, quantity, expiry_date });
      await coupon.save();

      return res.status(201).json({ message: 'Tạo coupon thành công', coupon });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo coupon', error });
    }
  }

  // [PUT] /coupons/:id
  async update(req, res) {
    try {
      let { code, description, value, quantity, expiry_date } = req.body;

      // Validate các trường
      if (!code || !value || !quantity || !expiry_date) {
        return res.status(400).json({ message: 'Code, giá trị, số lượng và ngày hết hạn là bắt buộc.' });
      }

      if (isNaN(value) || value < 1 || value > 100) {
        return res.status(400).json({ message: 'Gi� tr? gi?m ph?i t? 1 d?n 100.' });
      }

      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Số lượng phải là một số lớn hơn hoặc bằng 0.' });
      }

      const now = new Date();
      const expiryDate = new Date(expiry_date);

      if (expiryDate <= now) {
        return res.status(400).json({ message: 'Ngày hết hạn phải lớn hơn ngày hiện tại.' });
      }

      code = code.trim().toUpperCase();

      const existingCoupon = await Coupon.findOne({ code, _id: { $ne: req.params.id } });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Ma giam gia da ton tai.' });
      }

      const coupon = await Coupon.findByIdAndUpdate(req.params.id, { code, description, value, quantity, expiry_date }, { new: true });
      if (!coupon) {
        return res.status(404).json({ message: 'Không tìm thấy coupon' });
      }

      return res.json({ message: 'Cập nhật coupon thành công', coupon });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật coupon', error });
    }
  }

  // [DELETE] /coupons/:id
  async delete(req, res) {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Không tìm thấy coupon' });
      }
      return res.json({ message: 'Xóa coupon thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa coupon', error });
    }
  }
}

module.exports = new CouponController();

