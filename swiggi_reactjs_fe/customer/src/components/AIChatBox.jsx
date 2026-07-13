import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../api/config";

const CHAT_TIMEOUT_MS = 45000;
const CHAT_RETRY_DELAYS = [0, 1500, 3000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendChatMessageWithRetry = async (message) => {
  let lastError;

  for (let attempt = 0; attempt < CHAT_RETRY_DELAYS.length; attempt += 1) {
    if (CHAT_RETRY_DELAYS[attempt] > 0) {
      await sleep(CHAT_RETRY_DELAYS[attempt]);
    }

    try {
      return await axios.post(
        `${API_BASE_URL}/chat-ai`,
        { message },
        { timeout: CHAT_TIMEOUT_MS }
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Xin chào! Tôi là trợ lý AI, bạn cần hỗ trợ gì?",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (quickText) => {
    const messageToSend = quickText || input;

    if (!messageToSend.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      text: messageToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessageWithRetry(messageToSend);

      const aiMessage = {
        role: "ai",
        text: response.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "ai",
        text:
          error.response?.data?.reply ||
          "AI đang kết nối chậm. Bạn vui lòng thử lại sau vài giây nhé.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Quán có món gì?",
    "Món gà nào ngon?",
    "Có khuyến mãi không?",
    "Tôi có 100k nên ăn gì?",
  ];

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <div>
              <div style={styles.title}>AI Assistant</div>
              <div style={styles.subTitle}>Hỗ trợ tư vấn món ăn</div>
            </div>

            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div style={styles.body}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#007bff" : "#f1f1f1",
                  color: msg.role === "user" ? "#fff" : "#222",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "14px",
                  borderBottomLeftRadius: msg.role === "ai" ? "4px" : "14px",
                }}
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div style={styles.loadingMessage}>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
                <span style={styles.dot}>●</span>
                AI đang trả lời...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={styles.quickBox}>
            {quickQuestions.map((question) => (
              <button
                key={question}
                style={styles.quickBtn}
                onClick={() => handleSend(question)}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>

          <div style={styles.footer}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />

            <button
              style={{
                ...styles.sendBtn,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              onClick={() => handleSend()}
              disabled={isLoading}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button style={styles.chatButton} onClick={() => setIsOpen(true)}>
          AI Chat
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 9999,
  },
  chatButton: {
    padding: "13px 20px",
    borderRadius: "50px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  },
  chatBox: {
    width: "340px",
    height: "500px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: "15px",
  },
  subTitle: {
    fontSize: "12px",
    opacity: 0.9,
    marginTop: "2px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "26px",
    cursor: "pointer",
    lineHeight: 1,
  },
  body: {
    flex: 1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    overflowY: "auto",
    backgroundColor: "#fafafa",
  },
  message: {
    padding: "10px 13px",
    borderRadius: "14px",
    maxWidth: "78%",
    minWidth: "42px",
    fontSize: "14px",
    lineHeight: "20px",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
  loadingMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    color: "#555",
    padding: "9px 12px",
    borderRadius: "14px",
    borderBottomLeftRadius: "4px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  dot: {
    fontSize: "7px",
  },
  quickBox: {
    display: "flex",
    gap: "6px",
    padding: "8px 10px",
    overflowX: "auto",
    borderTop: "1px solid #eee",
    backgroundColor: "#fff",
  },
  quickBtn: {
    flexShrink: 0,
    border: "1px solid #d6e8ff",
    backgroundColor: "#eef6ff",
    color: "#007bff",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  footer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    gap: "8px",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
  },
  sendBtn: {
    padding: "9px 13px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AIChatBox;
