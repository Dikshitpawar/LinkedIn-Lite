const userSocketMap = {};

const addUser = (userId, socketId) => {
  userSocketMap[userId] = socketId;
};
const removeUser = (socketId) => {
  for (const userId in userSocketMap) {
    if (userSocketMap[userId] === socketId) {
      delete userSocketMap[userId];
      break;
    }
  }
};

const getSocketId = (userId) => {
  return userSocketMap[userId];
};
const isUserOnline = (userId) => {
  return !!userSocketMap[userId];
};
const getOnlineUserIds = () => {
  return Object.keys(userSocketMap);
};

module.exports = {
  addUser,
  removeUser,
  getSocketId,
  isUserOnline,
  getOnlineUserIds,
};
