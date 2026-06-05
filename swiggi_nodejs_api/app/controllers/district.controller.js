const District = require("../models/district.model.js");
const Province = require("../models/province.model.js");

class DistrictController {
  //[GET] /districts
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

      const districts = await District.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ created_at: -1 }) 
        .populate('province') 
        .exec();

      const count = await District.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      const result = {
        districts,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/districts?page=${pageNum + 1}&limit=${limitNum}&name=${name}` : null,
        prev: pageNum > 1 ? `/districts?page=${pageNum - 1}&limit=${limitNum}&name=${name}` : null
      };

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất quận huyện', error });
    }
  }

  //[GET] /districts/:id
  async show(req, res) {
    try {
      const district = await District.findById(req.params.id).populate('province');
      if (!district) {
        return res.status(404).json({ message: 'Không tìm thấy quận huyện' });
      }
      return res.json(district);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất quận huyện', error });
    }
  }

  //[POST] /districts
  async create(req, res) {
    try {
      const { name, province } = req.body;
      if (!name || !province) {
        return res.status(400).json({ message: 'Tên và tỉnh thành là bắt buộc.' });
      }

      const existingProvince = await Province.findById(province);
      if (!existingProvince) {
        return res.status(400).json({ message: 'Tỉnh thành không tồn tại.' });
      }

      const district = new District(req.body);
      await district.save();

      return res.status(201).json({ message: 'Tạo quận huyện thành công', district });

    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo quận huyện', error });
    }
  }

  //[PUT] /districts/:id
  async update(req, res) {
    try {
      const { name, province } = req.body;
      if (!name || !province) {
        return res.status(400).json({ message: 'Tên và tỉnh thành là bắt buộc.' });
      }

      const existingProvince = await Province.findById(province);
      if (!existingProvince) {
        return res.status(400).json({ message: 'Tỉnh thành không tồn tại.' });
      }

      const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('province');
      if (!district) {
        return res.status(404).json({ message: 'Không tìm thấy quận huyện' });
      }

      return res.json({ message: 'Cập nhật quận huyện thành công', district });

    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật quận huyện', error });
    }
  }

  //[DELETE] /districts/:id
  async delete(req, res) {
    try {
      const district = await District.findByIdAndDelete(req.params.id);
      if (!district) {
        return res.status(404).json({ message: 'Không tìm thấy quận huyện' });
      }
      return res.json({ message: 'Xóa quận huyện thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi xóa quận huyện', error });
    }
  }
}

module.exports = new DistrictController();
