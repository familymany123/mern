const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Food = require("../models/food.model.js");

const GEMINI_TIMEOUT_MS = 35000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI request timeout")), timeoutMs);
    }),
  ]);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Bạn chưa nhập tin nhắn.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        reply: "AI chưa được cấu hình khóa Gemini. Vui lòng kiểm tra GEMINI_API_KEY.",
      });
    }

    const foods = await Food.find({ show: true })
      .select("name price description")
      .limit(50)
      .lean();

    const menuText = foods
      .map((food, index) => {
        return `${index + 1}. ${food.name}
- Giá: ${food.price}đ
- Mô tả: ${food.description || "Không có mô tả"}`;
      })
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
Bạn là trợ lý AI của cửa hàng đồ ăn nhanh.

Nhiệm vụ:
- Tư vấn món ăn cho khách.
- Trả lời về menu, giá, topping, khuyến mãi và giao hàng.
- Trả lời ngắn gọn, dễ hiểu, thân thiện.
- Luôn trả lời bằng tiếng Việt.

Quy tắc:
- Chỉ trả lời các câu hỏi liên quan đến cửa hàng đồ ăn nhanh.
- Nếu khách hỏi ngoài chủ đề, hãy trả lời: "Mình chỉ hỗ trợ thông tin về món ăn và cửa hàng ạ."
- Không tự bịa món ăn, giá tiền hoặc khuyến mãi.

Menu hiện tại từ database MongoDB:
${menuText || "Hiện chưa có dữ liệu món ăn."}

Câu hỏi của khách:
${message.trim()}
`;

    const result = await withTimeout(
      model.generateContent(prompt),
      GEMINI_TIMEOUT_MS
    );
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      reply: text || "Mình chưa có câu trả lời phù hợp, bạn hỏi lại giúp mình nhé.",
    });
  } catch (error) {
    console.error("Chat AI failed:", error.message);

    return res.status(503).json({
      success: false,
      reply: "AI đang phản hồi chậm hoặc tạm thời quá tải. Bạn thử lại sau vài giây nhé.",
    });
  }
});

module.exports = router;
