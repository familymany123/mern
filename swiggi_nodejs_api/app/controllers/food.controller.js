const mongoose = require('mongoose');
const Food = require("../models/food.model.js");
const Category = require('../models/category.model.js');
const DetailOrder = require("../models/detail_orders.model.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const categoryOrderSlugs = [
  'combo-an-nhanh',
  'ga-ran',
  'burger',
  'mi-y',
  'mon-phu',
  'thuc-uong'
];

class FoodController {
  // [GET] /foods
  async index(req, res) {
    try {
      const { page = 1, limit = 10, name = '', sort = '' } = req.query;
      const pageNum = parseInt(page);
      const isAllLimit = String(limit).toLowerCase() === 'all';
      const limitNum = isAllLimit ? 0 : parseInt(limit);

      // Validate page và limit phải là số nguyên dương
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (!isAllLimit && (isNaN(limitNum) || limitNum < 1)) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Tìm kiếm các món ăn theo tên (nếu có)
      const queryCondition = name ? { name: new RegExp(name, 'i') } : {};

      const foods = await Food.aggregate([
        // Lọc món ăn theo điều kiện queryCondition
        { $match: queryCondition },
      
        // Kết nối với bảng detail_orders để lấy thông tin số lượng đã bán
        {
          $lookup: {
            from: 'detail_orders', // Tên collection detail_orders
            localField: '_id', // Trường liên kết trong bảng foods
            foreignField: 'food', // Trường liên kết trong bảng detail_orders
            as: 'orderDetails' // Đặt tên cho mảng kết quả lookup
          }
        },
      
        // Thêm trường tổng số lượng đã bán bằng cách tính tổng quantity
        {
          $addFields: {
            sold: {
              $sum: '$orderDetails.quantity'
            }
          }
        },
      
        // Kết nối với bảng categories để lấy thông tin danh mục
        {
          $lookup: {
            from: 'categories', // Tên collection categories
            localField: 'category', // Trường liên kết trong bảng foods
            foreignField: '_id', // Trường liên kết trong bảng categories
            as: 'categoryDetails' // Đặt tên cho mảng kết quả lookup
          }
        },
      
        // Chuyển categoryDetails từ mảng thành object (nếu chỉ có một category)
        {
          $addFields: {
            category: { $arrayElemAt: ['$categoryDetails', 0] },
            categoryOrder: {
              $indexOfArray: [categoryOrderSlugs, { $arrayElemAt: ['$categoryDetails.slug', 0] }]
            }
          }
        },

        {
          $addFields: {
            categoryOrder: {
              $cond: [{ $eq: ['$categoryOrder', -1] }, 999, '$categoryOrder']
            },
            popularityGroup: {
              $switch: {
                branches: [
                  { case: { $lte: ['$categoryOrder', 3] }, then: 0 },
                  { case: { $eq: ['$categoryOrder', 4] }, then: 1 },
                  { case: { $eq: ['$categoryOrder', 5] }, then: 2 }
                ],
                default: 3
              }
            }
          }
        },
      
        // Loại bỏ các trường không cần thiết
        {
          $project: {
            orderDetails: 0, // Loại bỏ mảng orderDetails
            categoryDetails: 0 // Loại bỏ mảng categoryDetails sau khi gán
          }
        },
      
        // Phân trang
        ...(sort === 'sold'
          ? [{ $sort: { popularityGroup: 1, sold: -1, created_at: -1 } }]
          : [{ $sort: { categoryOrder: 1, created_at: 1 } }]),

        { $project: { categoryOrder: 0, popularityGroup: 0 } },

        ...(isAllLimit
          ? []
          : [
              { $skip: (pageNum - 1) * limitNum },
              { $limit: limitNum }
            ])
      ]);

      const count = await Food.countDocuments(queryCondition);
      const totalPages = isAllLimit ? 1 : Math.ceil(count / limitNum);

      return res.json({
        foods,
        totalPages,
        currentPage: isAllLimit ? 1 : pageNum,
        next: !isAllLimit && pageNum < totalPages ? `/foods?page=${pageNum + 1}&limit=${limitNum}&name=${name}` : null,
        prev: !isAllLimit && pageNum > 1 ? `/foods?page=${pageNum - 1}&limit=${limitNum}&name=${name}` : null
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh sách món ăn', error });
    }
  }

  // [GET] /foods/:id
  async show(req, res) {
    try {
      let food = await Food.findById(req.params.id).populate('category');
      if (!food) {
        return res.status(404).json({ message: 'Không tìm thấy món ăn' });
      }

      const sold = await DetailOrder.aggregate([
        {
          $match: { food: new mongoose.Types.ObjectId(req.params.id) } // Sử dụng 'new' để khởi tạo ObjectId
        },
        {
          $group: {
            _id: '$food',
            totalSold: { $sum: '$quantity' }
          }
        }
      ]);

      
      // Nếu không có đơn hàng nào liên quan, set totalSold = 0
      const totalSold = sold.length > 0 ? sold[0].totalSold : 0;
      food = { ...food.toObject(), sold: totalSold };
      
      return res.json(food);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất món ăn', error });
    }
  }

  // [GET] /foods/list_category
  async listByCategory(req, res) {
    try {
      // Lấy tất cả chuyên mục
      const categories = await Category.aggregate([
        {
          $addFields: {
            categoryOrder: {
              $indexOfArray: [categoryOrderSlugs, '$slug']
            }
          }
        },
        {
          $addFields: {
            categoryOrder: {
              $cond: [{ $eq: ['$categoryOrder', -1] }, 999, '$categoryOrder']
            }
          }
        },
        { $sort: { categoryOrder: 1, created_at: 1 } },
        { $project: { categoryOrder: 0 } }
      ]);
  
      // Khởi tạo mảng để lưu kết quả
      const result = [];
  
      // Lặp qua từng chuyên mục
      for (const category of categories) {
        // Kiểm tra số lượng món ăn thuộc chuyên mục
        const foodCount = await Food.countDocuments({ category: category._id });
  
        // Nếu có ít nhất 1 món ăn, lấy danh sách món ăn (giới hạn 8) và thêm vào kết quả
        if (foodCount > 0) {
          const foods = await Food.find({ category: category._id })
            .limit(8) // Giới hạn số món ăn là 8
            .lean();
  
          // Tính tổng số lượng đã bán cho từng món ăn
          const foodIds = foods.map(food => food._id);
          const soldData = await DetailOrder.aggregate([
            {
              $match: { food: { $in: foodIds } }
            },
            {
              $group: {
                _id: '$food',
                totalSold: { $sum: '$quantity' }
              }
            }
          ]);
  
          // Tạo một map để nhanh chóng tra cứu số lượng đã bán
          const soldMap = soldData.reduce((map, item) => {
            map[item._id.toString()] = item.totalSold;
            return map;
          }, {});
  
          result.push({
            _id: category._id,
            name: category.name,
            slug: category.slug,
            image: category.image,
            created_at: category.created_at,
            updated_at: category.updated_at,
            foods: foods.map(food => ({
              _id: food._id,
              name: food.name,
              price: food.price,
              description: food.description,
              image: food.image,
              slug: food.slug,
              cooking_time: food.cooking_time,
              type: food.type,
              show: food.show,
              created_at: food.created_at,
              updated_at: food.updated_at,
              sold: soldMap[food._id.toString()] || 0, // Nếu không có sold, set mặc định là 0
            })),
          });
        }
      }
  
      // Trả về kết quả
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi truy xuất danh sách món ăn theo chuyên mục', error });
    }
  }

  // [POST] /foods
  async create(req, res) {
    try {
      const { name, price, slug, category } = req.body;

      // Validate bắt buộc các trường name, price, slug, category_id
      if (!name || !price || !slug || !category) {
        return res.status(400).json({ message: 'Tên, giá, slug và danh mục là bắt buộc.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // Slug pattern: lowercase letters, numbers, and hyphens
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug không hợp lệ. Vui lòng sử dụng chỉ chữ thường, số và dấu gạch nối.' });
      }

      // Validate file upload
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          fs.unlinkSync(path.join('uploads', imageFile.filename)); // Xóa tệp không hợp lệ
          return res.status(400).json({ message: 'Tệp tải lên không hợp lệ. Vui lòng chọn tệp hình ảnh.' });
        }

        // Validate file size (limit to 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (imageFile.size > maxSize) {
          fs.unlinkSync(path.join('uploads', imageFile.filename)); // Xóa tệp lớn quá giới hạn
          return res.status(400).json({ message: 'Tệp hình ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.' });
        }

        // Construct the full URL for the image
        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      }else{
        return res.status(400).json({ message: 'Vui lòng chọn ảnh món ăn' });
      }

      const food = new Food(req.body);
      await food.save();

      return res.status(201).json({ message: 'Tạo món ăn thành công', food });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo món ăn', error });
    }
  }

  // [PUT] /foods/:id
  async update(req, res) {
    try {
      if (req.body.category && typeof req.body.category === 'object') {
        req.body.category = req.body.category._id;
      }

      const { name, price, slug, category } = req.body;

      // Validate bắt buộc các trường name, price, slug, category
      if (!name || !price || !slug || !category) {
        return res.status(400).json({ message: 'Tên, giá, slug và danh mục là bắt buộc.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug không hợp lệ. Vui lòng sử dụng chỉ chữ thường, số và dấu gạch nối.' });
      }

      // Validate và xử lý file upload
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

      const updateData = {
        name,
        price,
        slug,
        category,
        description: req.body.description,
        cooking_time: req.body.cooking_time,
        type: req.body.type,
        show: req.body.show,
        updated_at: Date.now()
      };

      if (req.body.image) {
        updateData.image = req.body.image;
      }

      const food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!food) {
        return res.status(404).json({ message: 'Không tìm thấy món ăn' });
      }

      return res.json({ message: 'Cập nhật món ăn thành công', food });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật món ăn', error });
    }
  }

  // [DELETE] /foods/:id
  async delete(req, res) {
    try {
      const food = await Food.findByIdAndDelete(req.params.id);
      if (!food) {
        return res.status(404).json({ message: 'Không tìm thấy món ăn' });
      }
      return res.json({ message: 'Xóa món ăn thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa món ăn', error });
    }
  }
}

module.exports = new FoodController();

