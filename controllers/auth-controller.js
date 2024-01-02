const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      mobile_secondaire,
      sex,
      username,
      password,
      lieu_de_naissance,
      date_de_naissance,
      province,
      ville,
      profile_picture,
      cover_picture,
    } = req.body;

    let randomImageId = 0;
    let randomProfilePicture = "";

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "L'e-mail existe déjà" });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res
        .status(409)
        .json({ message: "Le numéro de téléphone existe déjà" });
    }

    // const existingUsername = await User.findOne({ username });
    // if (existingUsername) {
    //   return res.status(409).json({ message: "Le nom d'utilisateur existe déjà" });
    // }

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
      mobile_secondaire,
      username,
      password: hashedPassword,
      sex,
      lieu_de_naissance,
      date_de_naissance,
      province,
      ville,
      profile_picture: profile_picture || randomProfilePicture,
      cover_picture,
    });

    await newUser.save();
    return res
      .status(200)
      .json({ message: "Utilisateur créé avec succès", email, password });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if the user exists
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // compare password
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Mot de passe invalide" });
    }

    // generate token
    const SECRET_KEY = process.env.SECRET_KEY;
    const userData = {
      userId: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      mobile: foundUser.mobile,
      sex: foundUser.sex,
      username: foundUser.username,
      profile_picture: foundUser.profile_picture,
      cover_picture: foundUser.cover_picture,
    };

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });

    // envoyer email notifiant la creation du compte et demenadant son activation
    return await res.status(200).json({
      message: "Connexion réussie",
      user: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const users = await User.find().exec();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {};

exports.profile = async (req, res) => {};
