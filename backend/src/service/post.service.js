const uploadImage = require("../service/storage.service");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const ApiError = require("../utils/errorHandler");
const { v4: uuidv4 } = require("uuid");

const createPost = async (title, content, file, currentUserId) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  let imageUrl = "";
  if (file) {
    const image = await uploadImage(
      file.buffer.toString("base64"),
      uuidv4(),
      "linkedin-img",
    );
    imageUrl = image.url;
  }
  const post = await Post.create({
    title: title,
    content: content,
    image: imageUrl,
    user: currentUser._id,
  });

  await post.populate("user", "name profilePic");

  return post;
};

const getAllPost = async (currentUserId) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  const posts = await Post.find()
    .populate("user", "name profilePic")
    .populate("comments.user", "name profilePic")
    .sort({ createdAt: -1 });

  return posts;
};

const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate("user", "name profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return post;
};

const updatedPost = async (
  postId,
  currentUserId,
  title,
  content,
  file,
  removeImage,
) => {
  const updateData = {};
  if (title) {
    updateData.title = title;
  }
  if (content) {
    updateData.content = content;
  }
  if (file) {
    const image = await uploadImage(
      file.buffer.toString("base64"),
      uuidv4(),
      "linkedin-img",
    );
    updateData.image = image.url;
  } else if (removeImage) {
    updateData.image = "";
  }

  const post = await Post.findOneAndUpdate(
    { _id: postId, user: currentUserId },
    updateData,
    { new: true },
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  await post.populate("user", "name profilePic");

  return post;
};

const deletePost = async (postId, currentUserId) => {
  const post = await Post.findOneAndDelete({
    _id: postId,
    user: currentUserId,
  });
  if (!post) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }
  return true;
};

const likePost = async (postId, currentUserId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const alreadyLiked = post.likes.some(
    (id) => id.toString() === currentUserId.toString(),
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== currentUserId.toString(),
    );
  } else {
    post.likes.push(currentUserId);
  }

  await post.save();

  return {
    liked: !alreadyLiked,
    likesCount: post.likes.length,
  };
};

const commentPost = async (postId, text, currentUserId) => {
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: { user: currentUserId, text } } },
    { new: true },
  )
    .populate("user", "name profilePic")
    .populate("comments.user", "name profilePic");

  if (!updated) {
    throw new ApiError(404, "Post not found");
  }

  return updated;
};

module.exports = {
  createPost,
  getAllPost,
  getPostById,
  updatedPost,
  deletePost,
  likePost,
  commentPost,
};
