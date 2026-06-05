const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // Sử dụng cùng giá trị bí mật như trong UserController

// Middleware để xác thực người dùng
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Token không hợp lệ.' });
    req.user = user;
    next();
  });
}

// Middleware để kiểm tra vai trò admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản quản lý để thực hiện.' });
  }
  next();
}

// Middleware để kiểm tra vai trò customer
function requireCustomer(req, res, next) {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản "Khách hàng" để thực hiện.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireCustomer };
