import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "https://shadow-market-cc.vercel.app",
        methods: ["GET", "POST"],
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
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
      });

      socket.on("sendMessage", (message) => {
        const room = [message.sender, message.receiver].sort().join("-");
        io.to(room).emit("message", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
