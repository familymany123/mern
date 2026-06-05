const Config = require('../models/config.model.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class ConfigController {
  //[GET] /configs
  async index(req, res) {
    try {
      const configs = await Config.find();
      return res.json(configs);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất cấu hình', error });
    }
  }

  //[GET] /configs/:id
  async show(req, res) {
    try {
      const config = await Config.findById(req.params.id);
      if (!config) {
        return res.status(404).json({ message: 'Không tìm thấy cấu hình' });
      }
      return res.json(config);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất cấu hình', error });
    }
  }

  //[PUT] /configs/:id
  async update(req, res) {
    try {
      if (req.files && req.files.length > 0) {
        const logoFile = req.files.find(file => file.fieldname === 'logo');
        const faviconFile = req.files.find(file => file.fieldname === 'favicon');

        // Validate and handle file uploads
        if (logoFile) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(logoFile.mimetype)) {
            fs.unlinkSync(path.join('uploads', logoFile.filename));
            return res.status(400).json({ message: 'Tệp logo không hợp lệ.' });
          }
          const maxSize = 2 * 1024 * 1024; // 2MB
          if (logoFile.size > maxSize) {
            fs.unlinkSync(path.join('uploads', logoFile.filename));
            return res.status(400).json({ message: 'Tệp logo quá lớn.' });
          }
          req.body.logo = `${process.env.BASE_API}/uploads/${logoFile.filename}`;
        }

        if (faviconFile) {
          const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon'];
          if (!allowedTypes.includes(faviconFile.mimetype)) {
            fs.unlinkSync(path.join('uploads', faviconFile.filename));
            return res.status(400).json({ message: 'Tệp favicon không hợp lệ.' });
          }
          const maxSize = 512 * 1024; // 512KB
          if (faviconFile.size > maxSize) {
            fs.unlinkSync(path.join('uploads', faviconFile.filename));
            return res.status(400).json({ message: 'Tệp favicon quá lớn.' });
          }
          req.body.favicon = `${process.env.BASE_API}/uploads/${faviconFile.filename}`;
        }
      }

      const config = await Config.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!config) {
        return res.status(404).json({ message: 'Không tìm thấy cấu hình' });
      }

      return res.json({ message: 'Cập nhật cấu hình thành công', config });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật cấu hình', error });
    }
  }

}

module.exports = new ConfigController();
