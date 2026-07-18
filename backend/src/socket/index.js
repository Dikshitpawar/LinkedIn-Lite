const { Server } = require("socket.io");
const socketHandler = require("../utils/socketHandler");
const socketAuth = require("../middlewares/socketAuth.middleware");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://linkedin-lite-frontend.onrender.com",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    socketHandler(io, socket);
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket Not Initialized");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
