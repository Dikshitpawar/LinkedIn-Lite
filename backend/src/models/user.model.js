const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    profilePic: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

userSchema.plugin(paginate);

const User = mongoose.model("User", userSchema);

module.exports = User;
