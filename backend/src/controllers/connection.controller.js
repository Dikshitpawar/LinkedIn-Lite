const { asyncHandler } = require("../utils/asyncHandler");
const { connectionService } = require("../service/index");
const { getIO } = require("../socket");
const { getSocketId } = require("../utils/userSocketMap");

const sendRequest = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;
  const result = await connectionService.sendRequest(
    targetUserId,
    currentUserId,
  );

  const io = getIO();
  const receiverSocketId = getSocketId(targetUserId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("notification", {
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      message: `${req.user.name} sent you a friend request.`,
    });
    io.to(receiverSocketId).emit("connection-update", {
      type: "incoming-request",
    });
  }

  res.status(200).json({
    success: true,
    message: "Request sent successfully.!",
  });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.id;
  const currentUserId = req.user._id;
  const result = await connectionService.acceptRequest(
    requesterId,
    currentUserId,
  );

  const io = getIO();
  const senderSocketId = getSocketId(requesterId);

  if (senderSocketId) {
    io.to(senderSocketId).emit("notification", {
      sender: {
        name: req.user.name,
        email: req.user.email,
      },
      message: `${req.user.name} accepted your friend request.`,
    });
    io.to(senderSocketId).emit("connection-update", {
      type: "request-accepted",
    });
  }

  res.status(200).json({
    success: true,
    message: "Connection request accepted",
  });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.id;
  const currentUserId = req.user._id;
  const result = await connectionService.rejectRequest(
    requesterId,
    currentUserId,
  );

  const io = getIO();
  const senderSocketId = getSocketId(requesterId);

  if (senderSocketId) {
    io.to(senderSocketId).emit("notification", {
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      message: `${req.user.name} declined your friend request.`,
    });
    io.to(senderSocketId).emit("connection-update", {
      type: "request-rejected",
    });
  }

  res.status(200).json({
    success: true,
    message: "Connection request rejected",
  });
});

const removeConnection = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;
  const result = await connectionService.removeConnection(
    targetUserId,
    currentUserId,
  );

  const io = getIO();
  const senderSocketId = getSocketId(targetUserId);

  if (senderSocketId) {
    io.to(senderSocketId).emit("notification", {
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      message: `${req.user.name} removed you from their connections.`,
    });
    io.to(senderSocketId).emit("connection-update", {
      type: "connection-removed",
    });
  }

  res.status(200).json({
    success: true,
    message: "Connection removed successfully.!",
  });
});

const getConnections = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const currentUserId = req.user._id;
  const connections = await connectionService.getConnections(
    page,
    limit,
    currentUserId,
    status || "accept",
  );

  res.status(200).json({
    success: true,
    message: "Connections fetched successfully.!",
    data: connections,
  });
});

const getSuggestions = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const currentUserId = req.user._id;
  const suggestions = await connectionService.getSuggestions(
    page,
    limit,
    currentUserId,
  );

  res.status(200).json({
    success: true,
    message: "Suggestions fetched successfully.!",
    data: suggestions,
  });
});

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getConnections,
  getSuggestions,
};
