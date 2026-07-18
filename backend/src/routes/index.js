const express = require('express');
const authRoutes = require("./auth.routes")
const connectionRoutes = require("./connection.route");
const postRoutes = require("./post.routes");
const profileRoutes = require("./profile.routes")

const router = express.Router();
router.use("/auth" , authRoutes);
router.use("/connection" , connectionRoutes);
router.use("/post" , postRoutes);
router.use("/profile" , profileRoutes)

module.exports = router