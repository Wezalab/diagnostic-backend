const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true, sparse: true }, // Changed to sparse for Google users
  mobile_secondaire: { type: String },
  username: { type: String },
  password: { type: String }, // Removed required for Google OAuth users
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
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },
  status: {
    type: String,
    enum: ["ACTIVATED", "DEACTIVATED"],
    default: "DEACTIVATED",
  },
  bio: { type: String },
  experience: { type: String },
  qualityCoach: [{ type: String }],
  project: { type: String },
  detailsOfProject: { type: String },
  // Google OAuth fields
  googleId: { type: String }, // Google's unique user ID
  emailVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  imageUrl: { type: String } // Google profile picture URL
});

const User = mongoose.model("User", userSchema);
module.exports = User;
