const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true, required: true },
  username: { type: String, unique: true },
  sex: {
    type: String,
    enum: ["M", "F", "AUTRE"],
    default: "M",
  },
  password: { type: String, required: true },
  role: { type: String, default: "USER" },
  profile_picture: { type: String },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
