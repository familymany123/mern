require("dotenv").config();

const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const multer = require("multer");
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./app/config/db.config.js");

// Initialize express app
const app = express();

// Tạo HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Gắn io vào app
app.set("io", io);

// Khi client kết nối socket
io.on("connection", (socket) => {
  console.log("Admin/Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Admin/Client disconnected:", socket.id);
  });
});

// Connect MongoDB
connectDB();

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.use(upload.any());

// Method override
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
const route = require("./app/routes/index.js");

route(app);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
