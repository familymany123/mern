const mongoose = require('mongoose');
const Category = require("../models/category.model.js");
const Food = require("../models/food.model.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class CategoryController {
  //[GET] /categories
  async index(req, res) {
    try {
      const { page = 1, limit = 10, name = '' } = req.query;

      // Kiểm tra và xử lý các giá trị của query parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Validate page và limit phải là số nguyên dương
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Xây dựng điều kiện tìm kiếm theo tên
      const queryCondition = name ? { name: new RegExp(name, 'i') } : {};

      const categories = await Category.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .exec();

      const count = await Category.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      const result = {
        categories,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/categories?page=${pageNum + 1}&limit=${limitNum}&name=${name}` : null,
        prev: pageNum > 1 ? `/categories?page=${pageNum - 1}&limit=${limitNum}&name=${name}` : null
      };

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh mục', error });
    }
  }

  //[GET] /categories/:id
  async show(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      return res.json(category);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh mục', error });
    }
  }

  //[POST] /categories
  async create(req, res) {
    try {
      const { name, slug } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: 'Tên và slug là bắt buộc.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // Slug pattern: lowercase letters, numbers, and hyphens
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug không hợp lệ. Vui lòng sử dụng chỉ chữ thường, số và dấu gạch nối.' });
      }

      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          // Delete invalid file
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh.' });
        }

        // Validate file size (limit to 2MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (imageFile.size > maxSize) {
          // Delete large file
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp hình ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.' });
        }

        // Construct the full URL for the image
        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      } else {
        return res.status(400).json({ message: 'Vui lòng chọn ảnh chuyên mục' });
      }

      // Create a new category with the validated data
      const category = new Category(req.body);
      await category.save();

      // Respond with a success message and the created category
      return res.status(201).json({ message: 'Tạo danh mục thành công', category });

    } catch (error) {
      // Handle any errors that occur during the process
      return res.status(500).json({ message: 'Lỗi khi tạo danh mục', error });
    }
  }

  //[PUT] /categories/:id
  async update(req, res) {
    try {
      // Check if a file is being uploaded
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          // Delete invalid file
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh.' });
        }

        // Validate file size (limit to 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (imageFile.size > maxSize) {
          // Delete large file
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tệp hình ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.' });
        }

        // Construct the full URL for the image
        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      }

      // Validate the presence of required fields
      const { name, slug } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: 'Tên và slug là bắt buộc.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // Slug pattern: lowercase letters, numbers, and hyphens
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug không hợp lệ. Vui lòng sử dụng chỉ chữ thường, số và dấu gạch nối.' });
      }

      // Perform the update
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }

      // Respond with success message and updated category
      return res.json({ message: 'Cập nhật danh mục thành công', category });

    } catch (error) {
      // Handle any errors that occur during the update
      return res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error });
    }
  }

  //[DELETE] /categories/:id
  async delete(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      return res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa danh mục', error });
    }
  }

  // [GET] /categories/:id/foods
  async getFoodByCategory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Kiểm tra và xử lý các giá trị của query parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Validate page và limit phải là số nguyên dương
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Tìm Category bằng ID
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }

      // Lấy danh sách món ăn với số lượng đã bán (tính sold) và phân trang
      const foods = await Food.aggregate([
        // Lọc món ăn theo danh mục
        { $match: { category: new mongoose.Types.ObjectId(category._id) } },

        // Kết nối với bảng detail_orders để tính số lượng đã bán
        {
          $lookup: {
            from: 'detail_orders', // Tên collection detail_orders
            localField: '_id', // Trường liên kết trong bảng foods
            foreignField: 'food', // Trường liên kết trong bảng detail_orders
            as: 'orderDetails' // Đặt tên cho mảng kết quả lookup
          }
        },

        // Tính tổng số lượng đã bán
        {
          $addFields: {
            sold: {
              $sum: '$orderDetails.quantity'
            }
          }
        },

        // Bỏ mảng orderDetails để giữ dữ liệu gọn gàng
        {
          $project: {
            orderDetails: 0
          }
        },

        // Phân trang
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
      ]);

      // Tính tổng số món ăn trong danh mục
      const totalFoods = await Food.countDocuments({ category: category._id });

      // Tính tổng số trang
      const totalPages = Math.ceil(totalFoods / limitNum);

      // Kết quả trả về
      const result = {
        foods,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/categories/${category._id}/foods?page=${pageNum + 1}&limit=${limitNum}` : null,
        prev: pageNum > 1 ? `/categories/${category._id}/foods?page=${pageNum - 1}&limit=${limitNum}` : null
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn', error });
    }
  }

}

module.exports = new CategoryController();
