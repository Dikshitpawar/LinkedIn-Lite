const { asyncHandler } = require("../utils/asyncHandler");
const { profileService } = require("../service");

const getMyProfile = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await profileService.getMyProfile(currentUserId);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully.!",
    currentUser,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills, education, experience } = req.body;
  const file = req.file;
  const currentUserId = req.user._id;
  const profile = await profileService.updateProfile({
    name,
    bio,
    skills,
    education,
    experience,
    file,
    currentUserId,
  });

  res.status(200).json({
    success: true,
    message: "profile updated successfully.!",
    profile,
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await profileService.getUserProfile(userId);

  res.status(200).json({
    success: true,
    message: "profile fetched successfully.!",
    user,
  });
});

module.exports = { getMyProfile, updateProfile, getUserProfile };
