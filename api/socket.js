import { Server } from "socket.io";

let io; // lưu io global

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Initializing new Socket.io server...");

    io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "https://shadow-market-nextjs-frontend.vercel.app", // domain Next.js app
        methods: ["GET", "POST"],
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (token) {
        next();
      } else {
        console.log("No token, but allowing polling handshake");
        next();
      }
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("join", ({ userId, chatWith }) => {
        const room = [userId, chatWith].sort().join("-");
        socket.join(room);
        console.log(`User ${userId} joined room: ${room}`);
      });

      socket.on("sendMessage", (message) => {
        const room = [message.sender, message.receiver].sort().join("-");
        console.log("Sending message to room", room, ":", message);
        io.to(room).emit("message", message); // <- server broadcast lại cho đúng room
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.io server already running");
  }

  res.end();
}
