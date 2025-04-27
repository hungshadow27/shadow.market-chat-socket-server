const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://shadow-market-nextjs-frontend.vercel.app", // Domain Next.js
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
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
    console.log(`User joined room: ${room}`);
  });

  socket.on("sendMessage", (message) => {
    const room = [message.sender, message.receiver].sort().join("-");
    console.log("Sending message to room", room, ":", message);
    io.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
