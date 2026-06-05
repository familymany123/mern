const Banner = require("../models/banner.model.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class BannerController {
  //[GET] /banners
  async index(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      const banners = await Banner.find()
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate('category')
        .sort({ created_at: -1 })
        .exec();

      const count = await Banner.countDocuments();
      const totalPages = Math.ceil(count / limitNum);

      const result = {
        banners,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/banners?page=${pageNum + 1}&limit=${limitNum}` : null,
        prev: pageNum > 1 ? `/banners?page=${pageNum - 1}&limit=${limitNum}` : null
      };

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất banner', error });
    }
  }

  //[GET] /banners/:id
  async show(req, res) {
    try {
      const banner = await Banner.findById(req.params.id).populate('category');
      if (!banner) {
        return res.status(404).json({ message: 'Không tìm thấy banner' });
      }
      return res.json(banner);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất banner', error });
    }
  }

  //[POST] /banners
  async create(req, res) {
    try {
      const { category, show } = req.body;

      if (!category) {
        return res.status(400).json({ message: 'Chuyên mục là bắt buộc.' });
      }

      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh.' });
        }

        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp hình ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.' });
        }

        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      } else {
        return res.status(400).json({ message: 'Vui lòng chọn ảnh banner' });
      }

      const banner = new Banner(req.body);
      await banner.save();

      return res.status(201).json({ message: 'Tạo banner thành công', banner });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo banner', error });
    }
  }

  //[PUT] /banners/:id
  async update(req, res) {
    try {
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh.' });
        }

        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp hình ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.' });
        }

        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      }

      const { category } = req.body;
      if (!category) {
        return res.status(400).json({ message: 'Chuyên mục là bắt buộc.' });
      }

      const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!banner) {
        return res.status(404).json({ message: 'Không tìm thấy banner' });
      }

      return res.json({ message: 'Cập nhật banner thành công', banner });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật banner', error });
    }
  }

  //[DELETE] /banners/:id
  async delete(req, res) {
    try {
      const banner = await Banner.findByIdAndDelete(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: 'Không tìm thấy banner' });
      }
      return res.json({ message: 'Xóa banner thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa banner', error });
    }
  }
}

module.exports = new BannerController();
