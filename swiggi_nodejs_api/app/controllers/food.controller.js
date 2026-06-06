const mongoose = require('mongoose');
const Food = require("../models/food.model.js");
const Category = require('../models/category.model.js');
const DetailOrder = require("../models/detail_orders.model.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class FoodController {
  categoryOrderSlugs = [
    'combo-an-nhanh',
    'ga-ran',
    'burger',
    'mi-y',
    'mon-phu',
    'thuc-uong'
  ];

  // [GET] /foods
  async index(req, res) {
    try {
      const { page = 1, limit = 10, name = '', sort = '' } = req.query;
      const pageNum = parseInt(page);
      const isAllLimit = String(limit).toLowerCase() === 'all';
      const limitNum = isAllLimit ? 0 : parseInt(limit);

      // Validate page vÃ  limit pháº£i lÃ  sá»‘ nguyÃªn dÆ°Æ¡ng
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang pháº£i lÃ  sá»‘ nguyÃªn dÆ°Æ¡ng' });
      }
      if (!isAllLimit && (isNaN(limitNum) || limitNum < 1)) {
        return res.status(400).json({ message: 'Giá»›i háº¡n pháº£i lÃ  sá»‘ nguyÃªn dÆ°Æ¡ng' });
      }

      // TÃ¬m kiáº¿m cÃ¡c mÃ³n Äƒn theo tÃªn (náº¿u cÃ³)
      const queryCondition = name ? { name: new RegExp(name, 'i') } : {};

      const foods = await Food.aggregate([
        // Lá»c mÃ³n Äƒn theo Ä‘iá»u kiá»‡n queryCondition
        { $match: queryCondition },
      
        // Káº¿t ná»‘i vá»›i báº£ng detail_orders Ä‘á»ƒ láº¥y thÃ´ng tin sá»‘ lÆ°á»£ng Ä‘Ã£ bÃ¡n
        {
          $lookup: {
            from: 'detail_orders', // TÃªn collection detail_orders
            localField: '_id', // TrÆ°á»ng liÃªn káº¿t trong báº£ng foods
            foreignField: 'food', // TrÆ°á»ng liÃªn káº¿t trong báº£ng detail_orders
            as: 'orderDetails' // Äáº·t tÃªn cho máº£ng káº¿t quáº£ lookup
          }
        },
      
        // ThÃªm trÆ°á»ng tá»•ng sá»‘ lÆ°á»£ng Ä‘Ã£ bÃ¡n báº±ng cÃ¡ch tÃ­nh tá»•ng quantity
        {
          $addFields: {
            sold: {
              $sum: '$orderDetails.quantity'
            }
          }
        },
      
        // Káº¿t ná»‘i vá»›i báº£ng categories Ä‘á»ƒ láº¥y thÃ´ng tin danh má»¥c
        {
          $lookup: {
            from: 'categories', // TÃªn collection categories
            localField: 'category', // TrÆ°á»ng liÃªn káº¿t trong báº£ng foods
            foreignField: '_id', // TrÆ°á»ng liÃªn káº¿t trong báº£ng categories
            as: 'categoryDetails' // Äáº·t tÃªn cho máº£ng káº¿t quáº£ lookup
          }
        },
      
        // Chuyá»ƒn categoryDetails tá»« máº£ng thÃ nh object (náº¿u chá»‰ cÃ³ má»™t category)
        {
          $addFields: {
            category: { $arrayElemAt: ['$categoryDetails', 0] },
            categoryOrder: {
              $indexOfArray: [this.categoryOrderSlugs, { $arrayElemAt: ['$categoryDetails.slug', 0] }]
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
      
        // Loáº¡i bá» cÃ¡c trÆ°á»ng khÃ´ng cáº§n thiáº¿t
        {
          $project: {
            orderDetails: 0, // Loáº¡i bá» máº£ng orderDetails
            categoryDetails: 0 // Loáº¡i bá» máº£ng categoryDetails sau khi gÃ¡n
          }
        },
      
        // PhÃ¢n trang
        ...(sort === 'sold'
          ? [{ $sort: { sold: -1, created_at: -1 } }]
          : [{ $sort: { categoryOrder: 1, created_at: 1 } }]),

        { $project: { categoryOrder: 0 } },

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
      return res.status(500).json({ message: 'Lá»—i khi truy xuáº¥t danh sÃ¡ch mÃ³n Äƒn', error });
    }
  }

  // [GET] /foods/:id
  async show(req, res) {
    try {
      let food = await Food.findById(req.params.id).populate('category');
      if (!food) {
        return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y mÃ³n Äƒn' });
      }

      const sold = await DetailOrder.aggregate([
        {
          $match: { food: new mongoose.Types.ObjectId(req.params.id) } // Sá»­ dá»¥ng 'new' Ä‘á»ƒ khá»Ÿi táº¡o ObjectId
        },
        {
          $group: {
            _id: '$food',
            totalSold: { $sum: '$quantity' }
          }
        }
      ]);

      
      // Náº¿u khÃ´ng cÃ³ Ä‘Æ¡n hÃ ng nÃ o liÃªn quan, set totalSold = 0
      const totalSold = sold.length > 0 ? sold[0].totalSold : 0;
      food = { ...food.toObject(), sold: totalSold };
      
      return res.json(food);
    } catch (error) {
      return res.status(500).json({ message: 'Lá»—i khi truy xuáº¥t mÃ³n Äƒn', error });
    }
  }

  // [GET] /foods/list_category
  async listByCategory(req, res) {
    try {
      // Láº¥y táº¥t cáº£ chuyÃªn má»¥c
      const categories = await Category.aggregate([
        {
          $addFields: {
            categoryOrder: {
              $indexOfArray: [this.categoryOrderSlugs, '$slug']
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
  
      // Khá»Ÿi táº¡o máº£ng Ä‘á»ƒ lÆ°u káº¿t quáº£
      const result = [];
  
      // Láº·p qua tá»«ng chuyÃªn má»¥c
      for (const category of categories) {
        // Kiá»ƒm tra sá»‘ lÆ°á»£ng mÃ³n Äƒn thuá»™c chuyÃªn má»¥c
        const foodCount = await Food.countDocuments({ category: category._id });
  
        // Náº¿u cÃ³ Ã­t nháº¥t 1 mÃ³n Äƒn, láº¥y danh sÃ¡ch mÃ³n Äƒn (giá»›i háº¡n 8) vÃ  thÃªm vÃ o káº¿t quáº£
        if (foodCount > 0) {
          const foods = await Food.find({ category: category._id })
            .limit(8) // Giá»›i háº¡n sá»‘ mÃ³n Äƒn lÃ  8
            .lean();
  
          // TÃ­nh tá»•ng sá»‘ lÆ°á»£ng Ä‘Ã£ bÃ¡n cho tá»«ng mÃ³n Äƒn
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
  
          // Táº¡o má»™t map Ä‘á»ƒ nhanh chÃ³ng tra cá»©u sá»‘ lÆ°á»£ng Ä‘Ã£ bÃ¡n
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
              sold: soldMap[food._id.toString()] || 0, // Náº¿u khÃ´ng cÃ³ sold, set máº·c Ä‘á»‹nh lÃ  0
            })),
          });
        }
      }
  
      // Tráº£ vá» káº¿t quáº£
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lá»—i khi truy xuáº¥t danh sÃ¡ch mÃ³n Äƒn theo chuyÃªn má»¥c', error });
    }
  }

  // [POST] /foods
  async create(req, res) {
    try {
      const { name, price, slug, category } = req.body;

      // Validate báº¯t buá»™c cÃ¡c trÆ°á»ng name, price, slug, category_id
      if (!name || !price || !slug || !category) {
        return res.status(400).json({ message: 'TÃªn, giÃ¡, slug vÃ  danh má»¥c lÃ  báº¯t buá»™c.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // Slug pattern: lowercase letters, numbers, and hyphens
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug khÃ´ng há»£p lá»‡. Vui lÃ²ng sá»­ dá»¥ng chá»‰ chá»¯ thÆ°á»ng, sá»‘ vÃ  dáº¥u gáº¡ch ná»‘i.' });
      }

      // Validate file upload
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          fs.unlinkSync(path.join('uploads', imageFile.filename)); // XÃ³a tá»‡p khÃ´ng há»£p lá»‡
          return res.status(400).json({ message: 'Tá»‡p táº£i lÃªn khÃ´ng há»£p lá»‡. Vui lÃ²ng chá»n tá»‡p hÃ¬nh áº£nh.' });
        }

        // Validate file size (limit to 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (imageFile.size > maxSize) {
          fs.unlinkSync(path.join('uploads', imageFile.filename)); // XÃ³a tá»‡p lá»›n quÃ¡ giá»›i háº¡n
          return res.status(400).json({ message: 'Tá»‡p hÃ¬nh áº£nh quÃ¡ lá»›n. Vui lÃ²ng chá»n tá»‡p nhá» hÆ¡n 5MB.' });
        }

        // Construct the full URL for the image
        const imageUrl = `${process.env.BASE_API}/uploads/${imageFile.filename}`;
        req.body.image = imageUrl;
      }else{
        return res.status(400).json({ message: 'Vui lÃ²ng chá»n áº£nh mÃ³n Äƒn' });
      }

      const food = new Food(req.body);
      await food.save();

      return res.status(201).json({ message: 'Táº¡o mÃ³n Äƒn thÃ nh cÃ´ng', food });
    } catch (error) {
      return res.status(500).json({ message: 'Lá»—i khi táº¡o mÃ³n Äƒn', error });
    }
  }

  // [PUT] /foods/:id
  async update(req, res) {
    try {
      if (req.body.category && typeof req.body.category === 'object') {
        req.body.category = req.body.category._id;
      }

      const { name, price, slug, category } = req.body;

      // Validate báº¯t buá»™c cÃ¡c trÆ°á»ng name, price, slug, category
      if (!name || !price || !slug || !category) {
        return res.status(400).json({ message: 'TÃªn, giÃ¡, slug vÃ  danh má»¥c lÃ  báº¯t buá»™c.' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: 'Slug khÃ´ng há»£p lá»‡. Vui lÃ²ng sá»­ dá»¥ng chá»‰ chá»¯ thÆ°á»ng, sá»‘ vÃ  dáº¥u gáº¡ch ná»‘i.' });
      }

      // Validate vÃ  xá»­ lÃ½ file upload
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tá»‡p táº£i lÃªn khÃ´ng há»£p lá»‡. Vui lÃ²ng chá»n tá»‡p hÃ¬nh áº£nh.' });
        }

        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          fs.unlinkSync(path.join('uploads', imageFile.filename));
          return res.status(400).json({ message: 'Tá»‡p hÃ¬nh áº£nh quÃ¡ lá»›n. Vui lÃ²ng chá»n tá»‡p nhá» hÆ¡n 5MB.' });
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
        return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y mÃ³n Äƒn' });
      }

      return res.json({ message: 'Cáº­p nháº­t mÃ³n Äƒn thÃ nh cÃ´ng', food });
    } catch (error) {
      return res.status(500).json({ message: 'Lá»—i khi cáº­p nháº­t mÃ³n Äƒn', error });
    }
  }

  // [DELETE] /foods/:id
  async delete(req, res) {
    try {
      const food = await Food.findByIdAndDelete(req.params.id);
      if (!food) {
        return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y mÃ³n Äƒn' });
      }
      return res.json({ message: 'XÃ³a mÃ³n Äƒn thÃ nh cÃ´ng' });
    } catch (error) {
      return res.status(500).json({ message: 'Lá»—i khi xÃ³a mÃ³n Äƒn', error });
    }
  }
}

module.exports = new FoodController();

