const User = require("../models/user.model.js");
const RefreshToken = require("../models/refreshToken.model.js");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/errorHandler.js");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens.js");

const register = async (data) => {
  const { name, email, password } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const hasPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hasPassword });

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

const login = async (data) => {
  const { email, password } = data;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordCheck = await bcrypt.compare(password, user.password);

  if (!passwordCheck) {
    throw new ApiError(401, "Invalid credentials");
  }
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, accessToken, refreshToken };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(404, "Refresh token not found");
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const deletedToken = await RefreshToken.findOneAndDelete({
    token: refreshToken,
  });

  if (!deletedToken) {
    throw new ApiError(404, "Refresh token not found");
  }

  return true;
};

const RefreshApiService = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh Token missing");
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const storedToken = await RefreshToken.findOne({
    user: decoded.id,
    token: refreshToken,
  });

  if (!storedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (storedToken.expiresAt < Date.now()) {
    throw new ApiError(401, "Refresh token is expired");
  }

  const accessToken = generateAccessToken(decoded.id);
  return accessToken;
};

module.exports = { register, login, RefreshApiService, logout };
