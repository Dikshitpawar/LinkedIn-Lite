const express = require("express");
const { profileController } = require("../controllers");
const { auth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validateRequest");
const { profileSchema } = require("../validation");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", auth, profileController.getMyProfile);
router.post(
  "/update",
  auth,
  validate(profileSchema.updateProfileSchema),
  upload.single("file"),
  profileController.updateProfile,
);
router.get(
  "/:id",
  auth,
  validate(profileSchema.userProfileSchema),
  profileController.getUserProfile,
);

module.exports = router;
