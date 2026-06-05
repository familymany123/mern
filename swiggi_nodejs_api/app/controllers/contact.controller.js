const Contact = require('../models/contact.model');
const User = require('../models/user.model'); // Assuming you have a User model

class ContactController {
  //[GET] /contacts
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

      const contacts = await Contact.find()
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate('user') // Populate user information
        .sort({ created_at: -1 }) // Sort by created_at in descending order
        .exec();

      const count = await Contact.countDocuments();
      const totalPages = Math.ceil(count / limitNum);

      const result = {
        contacts,
        totalPages,
        currentPage: pageNum,
        next: pageNum < totalPages ? `/contacts?page=${pageNum + 1}&limit=${limitNum}` : null,
        prev: pageNum > 1 ? `/contacts?page=${pageNum - 1}&limit=${limitNum}` : null
      };

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất danh sách liên hệ', error });
    }
  }

  //[GET] /contacts/:id
  async show(req, res) {
    try {
      const contact = await Contact.findById(req.params.id).populate('user');
      if (!contact) {
        return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
      }
      return res.json(contact);
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi truy xuất liên hệ', error });
    }
  }

  //[POST] /contacts
  async create(req, res) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: 'Tin nhắn liên hệ là bắt buộc' });
      }

      const contact = new Contact({ user: req.user.userId, message });
      await contact.save();

      return res.status(201).json({ message: 'Tạo liên hệ thành công', contact });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi tạo liên hệ', error });
    }
  }

}

module.exports = new ContactController();
