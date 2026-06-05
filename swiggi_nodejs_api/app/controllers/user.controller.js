const User = require("../models/user.model.js");
const bcrypt = require('bcryptjs'); // Để mã hóa mật khẩu

class UserController {

  // [GET] /users
  async index(req, res) {
    try {
      const { page = 1, limit = 10, username } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: 'Trang phải là số nguyên dương' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ message: 'Giới hạn phải là số nguyên dương' });
      }

      // Điều kiện tìm kiếm
      const queryCondition = {};
      if (username) {
        queryCondition.username = new RegExp(username, 'i'); // Tìm kiếm không phân biệt chữ hoa chữ thường
      }

      queryCondition.role = "customer";

      const users = await User.find(queryCondition)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .exec();

      const count = await User.countDocuments(queryCondition);
      const totalPages = Math.ceil(count / limitNum);

      return res.json({
        users,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/users?page=${pageNum + 1}&limit=${limitNum}${username ? `&username=${username}` : ''}` : null,
        prev: pageNum > 1 ? `/users?page=${pageNum - 1}&limit=${limitNum}${username ? `&username=${username}` : ''}` : null
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh sách người dùng', error });
    }
  }

  // [GET] /users/:id
  async show(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất người dùng', error });
    }
  }

  async profile(req, res){
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất người dùng', error });
    }
  }

  // [PUT] /users
  async update(req, res) {
    try {
      const { fullname, address, phone, email, password } = req.body;

      // Validate các trường
      if (!fullname || !email || !address || !phone ) {
        return res.status(400).json({ message: 'Họ tên, email, địa chỉ và số điện thoại là bắt buộc.' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Kiểm tra trùng lặp số điện thoại (nếu có thay đổi)
      if (phone !== user.phone && await User.findOne({ phone })) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng.' });
      }

      // Kiểm tra trùng lặp email và username (nếu có thay đổi)
      if (email !== user.email && await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email đã được sử dụng.' });
      }

      // Mã hóa mật khẩu nếu có thay đổi
      let hashedPassword = user.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Cập nhật thông tin người dùng
      const updatedUser = await User.findByIdAndUpdate(req.user.userId, { fullname, address, phone, email, password: hashedPassword }, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      return res.json({ message: 'Cập nhật người dùng thành công', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', error });
    }
  }

  // [PATCH] /users/:id/block
  async block(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      if (!user.status) {
        user.status = true;
        await user.save();
        return res.json({ message: 'Bỏ chặn người dùng thành công', user });
      }else{
        // Thay đổi trạng thái của người dùng
        user.status = false;
        await user.save();
        return res.json({ message: 'Người dùng đã bị chặn thành công', user });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi chặn người dùng', error });
    }
  }
}

module.exports = new UserController();
