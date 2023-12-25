const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.signup = async (req, res) => {
  try {
    const { name, email, mobile, username, password, profile_picture } =
      req.body;

    let randomImageId = 0;
    let randomProfilePicture = "";

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(409).json({ message: "Phone Number already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // hashing password
    const saltRounds = 16;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // generate an image
    if (!profile_picture) {
      randomImageId = crypto.randomInt(0, 1000000);
      randomProfilePicture = `https://i.pravatar.cc/48?u=${randomImageId}`;
    }

    // creating a new user

    const newUser = new User({
      name,
      email,
      mobile,
      username,
      password: hashedPassword,
      profile_picture: profile_picture || randomProfilePicture,
    });

    await newUser.save();
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if the user exists
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare password
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // generate token
    const SECRET_KEY = process.env.SECRET_KEY;
    const userData = {
      userId: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      mobile: foundUser.mobile,
      username: foundUser.username,
      profile_picture: foundUser.profile_picture,
    };

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });
    return await res.status(200).json({
      message: "Login successful",
      user: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {};

exports.profile = async (req, res) => {};
