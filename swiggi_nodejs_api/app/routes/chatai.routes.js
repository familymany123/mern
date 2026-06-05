const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Food = require("../models/food.model.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Bạn chưa nhập tin nhắn",
      });
    }

    // Lấy danh sách món ăn từ MongoDB
    const foods = await Food.find({ show: true }).limit(50);

    // Convert menu thành text cho AI đọc
    const menuText = foods
      .map((food, index) => {
        return `
${index + 1}. ${food.name}
- Giá: ${food.price}đ
- Mô tả: ${food.description || "Không có mô tả"}
`;
      })
      .join("\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    // Prompt cho AI
    const prompt = `
Bạn là trợ lý AI của cửa hàng đồ ăn nhanh.

Nhiệm vụ của bạn:
- Tư vấn món ăn cho khách
- Trả lời về menu, giá, topping, khuyến mãi, giao hàng
- Trả lời ngắn gọn, dễ hiểu, thân thiện
- Luôn trả lời bằng tiếng Việt

Quy tắc:
- Chỉ trả lời các câu hỏi liên quan đến cửa hàng đồ ăn nhanh
- Nếu khách hỏi ngoài chủ đề, hãy trả lời:
"Mình chỉ hỗ trợ thông tin về món ăn và cửa hàng ạ."
- Không tự bịa món ăn, giá tiền, khuyến mãi

Menu hiện tại từ database MongoDB:
${menuText}

Câu hỏi của khách:
${message}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const text = response.text();

    return res.status(200).json({
      success: true,
      reply: text,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      reply: "AI đang lỗi",
    });
  }
});

module.exports = router;