const {
  addUser,
  removeUser,
  getOnlineUserIds,
} = require("../utils/userSocketMap");

const socketHandler = (io, socket) => {
  const userId = socket.user._id.toString();

  addUser(userId, socket.id);

  console.log(`${socket.user.name} Connected`);

  socket.broadcast.emit("user-status-change", {
    userId: userId,
    status: "online",
  });
  socket.emit("online-users-snapshot", {
    userIds: getOnlineUserIds().filter((id) => id !== userId),
  });

  socket.on("join-post", (postId) => {
    socket.join(`post_${postId}`);
    console.log(`User ${socket.user.name} joined room: post_${postId}`);
  });

  socket.on("leave-post", (postId) => {
    socket.leave(`post_${postId}`);
    console.log(`User ${socket.user.name} left room: post_${postId}`);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`${socket.user.name} Disconnected`);
    socket.broadcast.emit("user-status-change", {
      userId: userId,
      status: "offline",
    });
  });
};

module.exports = socketHandler;
