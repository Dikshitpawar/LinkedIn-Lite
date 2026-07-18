const { asyncHandler } = require("../utils/asyncHandler.js");
const ApiError = require("../utils/errorHandler.js");
const { authService } = require("../service");
const { refreshTokenCookieOptions } = require("../utils/cookieOption.js");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await authService.register({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User Registered Successfully.!",
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
  res.status(200).json({
    success: true,
    message: "User logged in successfully.!",
    accessToken: {
      token: accessToken,
      expiresAt: process.env.ACCESS_TOKEN_EXPIRES,
    },
    refreshToken: {
      token: refreshToken,
      expiresAt: process.env.REFRESH_TOKEN_EXPIRES,
    },
    user,
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await authService.logout(refreshToken);

  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "User logged out successfully.",
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User fetched successfully.!",
    user: req.user,
  });
});

const refreshAccesstoken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = await authService.RefreshApiService(refreshToken);

  res.status(201).json({
    success: true,
    message: "Access token generated successfully.!",
    accessToken: {
      token: accessToken,
      expiresAt: process.env.ACCESS_TOKEN_EXPIRES,
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshAccesstoken,
  getUserProfile,
};
