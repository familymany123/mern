const User = require("../models/user.model.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret'; // Thay đổi giá trị này với một bí mật mạnh
const JWT_EXPIRES_IN = '1h'; // Thay đổi thời gian hết hạn token nếu cần
const JWT_REFRESH_EXPIRES_IN = '7d'; // Thay đổi thời gian hết hạn refresh token nếu cần

class AuthController {
  
  // [POST] /register
  async register(req, res) {
    try {
      const { fullname, email, phone, username, password, address } = req.body;

      // Validate required fields
      if (!fullname || !email || !username || !password || !address || !phone) {
        return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin.' });
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ.' });
      }

      // Validate phone format (Vietnam phone number: 10 or 11 digits, starts with 0)
      const phoneRegex = /^0[1-9][0-9]{8,9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ. Vui lòng sử dụng số điện thoại Việt Nam.' });
      }

      // Check for existing phone, email, and username
      if (await User.findOne({ phone })) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng.' });
      }

      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email đã được sử dụng.' });
      }

      if (await User.findOne({ username })) {
        return res.status(400).json({ message: 'Tên người dùng đã được sử dụng.' });
      }

      // Set default role and status
      const role = 'customer';
      const status = true;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save new user
      const user = new User({ fullname, address, phone, email, username, password: hashedPassword, role, status });
      await user.save();

      return res.status(201).json({ message: 'Đăng ký tài khoản thành công', user });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi đăng ký tài khoản', error });
    }
  }

  // [POST] /login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Tài khoản và mật khẩu là bắt buộc.' });
      }

      const cleanedUsername = username.trim();

      // Tìm người dùng dựa trên username, email hoặc phone
      const user = await User.findOne({
        $or: [
          { username: cleanedUsername },
          { email: cleanedUsername },
          { phone: cleanedUsername }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu không đúng.' });
      }
      
      if (!user.status) {
        return res.status(400).json({ message: 'Tài khoản hiện bị cấm khỏi hệ thống.' });
      }

      const accessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

      return res.json({
        message: 'Đăng nhập thành công',
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi đăng nhập', error });
    }
  }

  // [POST] /refresh-token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token là bắt buộc.' });
      }

      jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Refresh token không hợp lệ.' });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.status) {
          return res.status(403).json({ message: 'Refresh token khong hop le.' });
        }

        const accessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({ accessToken });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi làm mới token', error });
    }
  }
}

module.exports = new AuthController();
