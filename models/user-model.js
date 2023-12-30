const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true, required: true },
  mobile_secondaire: { type: String, unique: true, required: true },
  username: { type: String },
  password: { type: String, required: true },
  sex: {
    type: String,
    enum: ["M", "F", "AUTRE"],
    default: "M",
  },
  lieu_de_naissance: { type: String },
  date_de_naissance: { type: Date },
  province: { type: String },
  ville: { type: String },
  role: { type: String, default: "USER" },
  profile_picture: { type: String },
  cover_picture: { type: String },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
