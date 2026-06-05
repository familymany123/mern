const Province = require("../models/province.model.js");

class ProvinceController {
  //[GET] /provinces
  async index(req, res) {
    try {
      const { page = 1, limit = 10, name = '' } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      const queryCondition = name ? { name: new RegExp(name, 'i') } : {};

      const provinces = await Province.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ created_at: -1 }) 
        .exec();

      const count = await Province.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      const result = {
        provinces,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/provinces?page=${pageNum + 1}&limit=${limitNum}&name=${name}` : null,
        prev: pageNum > 1 ? `/provinces?page=${pageNum - 1}&limit=${limitNum}&name=${name}` : null
      };

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất tỉnh thành', error });
    }
  }

  //[GET] /provinces/:id
  async show(req, res) {
    try {
      const province = await Province.findById(req.params.id);
      if (!province) {
        return res.status(404).json({ message: 'Không tìm thấy tỉnh thành' });
      }
      return res.json(province);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất tỉnh thành', error });
    }
  }

  //[POST] /provinces
  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Tên tỉnh thành là bắt buộc.' });
      }

      const province = new Province(req.body);
      await province.save();

      return res.status(201).json({ message: 'Tạo tỉnh thành thành công', province });

    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo tỉnh thành', error });
    }
  }

  //[PUT] /provinces/:id
  async update(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Tên tỉnh thành là bắt buộc.' });
      }

      const province = await Province.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!province) {
        return res.status(404).json({ message: 'Không tìm thấy tỉnh thành' });
      }

      return res.json({ message: 'Cập nhật tỉnh thành thành công', province });

    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật tỉnh thành', error });
    }
  }

  //[DELETE] /provinces/:id
  async delete(req, res) {
    try {
      const province = await Province.findByIdAndDelete(req.params.id);
      if (!province) {
        return res.status(404).json({ message: 'Không tìm thấy tỉnh thành' });
      }
      return res.json({ message: 'Xóa tỉnh thành thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa tỉnh thành', error });
    }
  }
}

module.exports = new ProvinceController();
