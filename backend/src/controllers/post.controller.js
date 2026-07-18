const { asyncHandler } = require("../utils/asyncHandler");
const { postService } = require("../service/index");
const { getIO } = require("../socket");

const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const file = req.file;
  const currentUserId = req.user._id;

  const post = await postService.createPost(
    title,
    content,
    file,
    currentUserId,
  );

  res.status(201).json({
    success: true,
    message: "Post created successfully.!",
    post,
  });
});

const getAllPost = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const posts = await postService.getAllPost(currentUserId);
  res.status(200).json({
    success: true,
    message: "All post fetched successfully.!",
    posts,
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await postService.getPostById(postId);

  res.status(200).json({
    success: true,
    message: "Post fetched successfully.!",
    data: post,
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const currentUserId = req.user._id;
  const { title, content, removeImage } = req.body;
  const file = req.file;

  const post = await postService.updatedPost(
    postId,
    currentUserId,
    title,
    content,
    file,
    removeImage === "true",
  );
  res.status(200).json({
    success: true,
    message: "Post updated successfully.!",
    post,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const currentUserId = req.user._id;
  await postService.deletePost(postId, currentUserId);
  res.status(200).json({
    success: true,
    message: "Post deleted successfully.!",
  });
});

const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const currentUserId = req.user._id;

  const post = await postService.likePost(postId, currentUserId);
  const io = getIO();

  io.to(`post_${postId}`).emit("like-update", {
    postId,
    likesCount: post.likesCount,
    liked: post.liked,
    userId: currentUserId,
  });

  res.status(200).json({
    success: true,
    message: post.liked ? "Post liked" : "Post unliked",
    post,
  });
});

const commentPost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const currentUserId = req.user._id;

  const post = await postService.commentPost(postId, text, currentUserId);
  const newComment = post.comments[post.comments.length - 1];

  const io = getIO();
  io.to(`post_${postId}`).emit("new-comment", {
    postId,
    comment: newComment,
  });

  res.status(200).json({
    success: true,
    message: "Comment added successfully",
    data: post,
  });
});

module.exports = {
  createPost,
  getAllPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentPost,
};
