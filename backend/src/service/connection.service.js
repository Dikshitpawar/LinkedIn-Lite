const ApiError = require("../utils/errorHandler");
const User = require("../models/user.model");
const Connection = require("../models/connection.model");

const sendRequest = async (targetUserId, currentUserId) => {
  if (targetUserId === currentUserId.toString()) {
    throw new ApiError(400, "You can not send request yourself");
  }
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    throw new ApiError(404, "User not found");
  }

  const connectionExist = await Connection.findOne({
    $or: [
      { sender: currentUserId, receiver: targetUserId },
      { sender: targetUserId, receiver: currentUserId },
    ],
  });

  if (connectionExist) {
    if (connectionExist.status === "block") {
      throw new ApiError(400, "You can not sent request to blocked user");
    } else if (connectionExist.status === "accept") {
      throw new ApiError(400, "You are already frineds");
    } else if (connectionExist.status === "pending") {
      if (connectionExist.receiver.toString() === currentUserId.toString()) {
        throw new ApiError(400, "User has already sent you request");
      }
      throw new ApiError(400, "you already sent request");
    } else if (connectionExist.status === "reject") {
      // A unique pairKey means we can't create a second row for this
      // pair — reuse the existing (rejected) one instead of failing.
      connectionExist.sender = currentUserId;
      connectionExist.receiver = targetUserId;
      connectionExist.status = "pending";
      await connectionExist.save();
      return true;
    }
  }

  try {
    await Connection.create({
      sender: currentUserId,
      receiver: targetUserId,
    });
  } catch (err) {
    // Lost a race to a concurrent request for the same pair (e.g. a
    // fast double-click, or both users requesting each other at the
    // same instant) — the unique pairKey index caught it at the DB
    // level; surface it as a normal error instead of a 500 crash.
    if (err.code === 11000) {
      throw new ApiError(
        400,
        "A connection request already exists between you two",
      );
    }
    throw err;
  }

  return true;
};

const acceptRequest = async (requesterId, currentUserId) => {
  if (requesterId === currentUserId.toString()) {
    throw new ApiError(400, "You can not accept request yourself");
  }
  const currentUser = await User.findById(currentUserId);
  const requester = await User.findById(requesterId);

  if (!currentUser || !requester) {
    throw new ApiError(404, "User not found");
  }

  const connectionExist = await Connection.findOne({
    status: "pending",
    $or: [
      { sender: currentUserId, receiver: requesterId },
      { sender: requesterId, receiver: currentUserId },
    ],
  });

  if (!connectionExist) {
    throw new ApiError(404, "Request not found");
  }

  if (connectionExist.sender.toString() === currentUserId.toString()) {
    throw new ApiError(400, "You cannot accept request to yourself");
  }

  connectionExist.status = "accept";
  await connectionExist.save();

  return true;
};

const rejectRequest = async (requesterId, currentUserId) => {
  if (requesterId === currentUserId.toString()) {
    throw new ApiError(400, "You can not reject request yourself");
  }
  const currentUser = await User.findById(currentUserId);
  const requester = await User.findById(requesterId);

  if (!currentUser || !requester) {
    throw new ApiError(404, "User not found");
  }

  const connectionExist = await Connection.findOne({
    status: "pending",
    $or: [
      { sender: currentUserId, receiver: requesterId },
      { sender: requesterId, receiver: currentUserId },
    ],
  });

  if (!connectionExist) {
    throw new ApiError(404, "Request not found");
  }

  if (connectionExist.sender.toString() === currentUserId.toString()) {
    throw new ApiError(400, "You cannot reject request to yourself");
  }

  connectionExist.status = "reject";
  await connectionExist.save();

  return true;
};

const removeConnection = async (targetUserId, currentUserId) => {
  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    throw new ApiError(404, "User not found");
  }

  const connectionDelete = await Connection.findOneAndDelete({
    status: "accept",
    $or: [
      { sender: currentUserId, receiver: targetUserId },
      { sender: targetUserId, receiver: currentUserId },
    ],
  });

  if (!connectionDelete) {
    throw new ApiError(404, "Connection not found");
  }

  return true;
};

const getConnections = async (
  page = 1,
  limit = 10,
  currentUserId,
  status = "accept",
) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  const connections = await Connection.paginate(
    {
      status,
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    },
    {
      page: Number(page),
      limit: Number(limit),
      populate: [
        {
          path: "sender",
          select: "name profilePic bio skills",
        },
        {
          path: "receiver",
          select: "name profilePic bio skills",
        },
      ],
    },
  );

  return connections;
};

const getSuggestions = async (page = 1, limit = 10, currentUserId) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  const connections = await Connection.find({
    $or: [{ sender: currentUserId }, { receiver: currentUserId }],
  });
  const excludedUserIds = [currentUserId];
  connections.forEach((connections) => {
    excludedUserIds.push(connections.sender.toString());
    excludedUserIds.push(connections.receiver.toString());
  });

  const suggestions = await User.paginate(
    {
      _id: { $nin: excludedUserIds },
    },
    {
      page: Number(page),
      limit: Number(limit),
      select: "name profilePic bio skills",
    },
  );

  return suggestions;
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getConnections,
  getSuggestions,
};
