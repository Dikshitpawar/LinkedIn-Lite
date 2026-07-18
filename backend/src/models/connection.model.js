const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
    pairKey: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

connectionSchema.pre("validate", function () {
  if (this.sender && this.receiver) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.pairKey = ids.join("_");
  }
});

connectionSchema.plugin(paginate);

const Connection = mongoose.model("Connection", connectionSchema);
module.exports = Connection;
