const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://shadow-market-cc.vercel.app", // URL của Next.js app
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // Xác thực token với Strapi nếu cần
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", ({ userId, chatWith }) => {
    const room = [userId, chatWith].sort().join("-");
    socket.join(room);
  });

  socket.on("sendMessage", (message) => {
    const room = [message.sender, message.receiver].sort().join("-");
    console.log(message, room);
    io.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});
