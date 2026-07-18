const User = require("../models/user.model");
const ApiError = require("../utils/errorHandler");
const uploadImage = require("../service/storage.service");
const { v4: uuidv4 } = require("uuid");

const getMyProfile = async (currentUserId) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new ApiError(404, "user not found");
  }
  return currentUser;
};

const updateProfile = async (data) => {
  const { name, bio, skills, education, experience, file, currentUserId } =
    data;

  const updateData = {};
  let profilePic;
  if (name) updateData.name = name;
  if (bio) updateData.bio = bio;
  if (skills) updateData.skills = skills;
  if (education) updateData.education = education;
  if (experience) updateData.experience = experience;
  if (file) {
    const result = await uploadImage(
      file.buffer.toString("base64"),
      uuidv4(),
      "linkedin-profile",
    );
    updateData.profilePic = result.url;
  }

  const profile = await User.findOneAndUpdate(
    { _id: currentUserId },
    updateData,
    { new: true },
  );

  if (!profile) {
    throw new ApiError(404, "profile not found");
  }

  return profile;
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  return user;
};

module.exports = { getMyProfile, updateProfile, getUserProfile };
