const express = require("express");
const multer = require("multer");
const { auth } = require("../middlewares/auth.middleware");
const { postController } = require("../controllers/index");
const validate = require("../middlewares/validateRequest");
const { postSchema } = require("../validation");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/create",
  auth,
  validate(postSchema.createPostSchema),
  upload.single("file"),
  postController.createPost,
);
router.get("/", auth, postController.getAllPost);
router.get(
  "/:id",
  auth,
  validate(postSchema.postIdSchema),
  postController.getPostById,
);
router.put(
  "/update/:id",
  auth,
  validate(postSchema.updatePostSchema),
  upload.single("file"),
  postController.updatePost,
);
router.delete(
  "/delete/:id",
  auth,
  validate(postSchema.postIdSchema),
  postController.deletePost,
);
router.post(
  "/like/:id",
  validate(postSchema.postIdSchema),
  auth,
  postController.likePost,
);
router.post(
  "/comment/:id",
  auth,
  validate(postSchema.commentPostSchema),
  postController.commentPost,
);

module.exports = router;
