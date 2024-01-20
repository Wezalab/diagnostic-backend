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

    // Save the user and get the saved user object
    const savedUser = await newUser.save();

    // Extract the _id from the saved user object
    const savedUserId = savedUser._id;

    return res
      .status(200)
      .json({
        message: "Utilisateur créé avec succès", email, password, userId: savedUserId, // Include the saved user ID in the response
      });
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
      role: foundUser.role,
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

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Cet email n'existe pas dans le système" });
    }

    // Generate a unique token for password reset
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the user with the reset token and expiration
    await user.save();

    // Send an email with the reset link
    const resetLink = `${process.env.BASE_URL}/auth/reset-password/${user._id}/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bvenceslas@gmail.com",
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "no-reply@business360.cd",
      to: user.email,
      subject: "Réinitialisez votre mot de passe",
      html: `
        <p>Bienvenu(e) ${user.name},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour le réinitialiser:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail.</p>
        <p>Cordialement,<br>business360</p>
        <img src="https://transforme.cd/storage/settings/September2023/w9j8CYEpPXjQ6r9PiRPS.png" alt="transforme image" width="300" height="150">
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Echec de l'envoi du e-mail" });
      } else {
        console.log("E-mail de réinitialisation envoyé: " + info.response);
        return res
          .status(200)
          .json({ message: "E-mail de réinitialisation envoyé avec succès" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.handleResetPassword = async (req, res) => {
  try {
    const { userId, resetToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Find the user by ID and check if the reset token is valid
    const user = await User.findById(userId);

    if (
      !user ||
      user.resetPasswordToken !== resetToken ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Lien de réinitialisation invalid ou expiré" });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passes ne correspondent pas" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 16);

    // Update the user's password and reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// exports.centralAchatAuth = async (req, res) => {
//   const { url, key_id,
//     user_id,
//     consumer_key,
//     consumer_secret,
//     key_permissions } = req.params;
//   try {

//     fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         key_id,
//         user_id,
//         consumer_key,
//         consumer_secret,
//         key_permissions
//       }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('API Response:', data);
//         return res.status(500).json({
//           message: `API Response: ${error.messageurl} ${url} , ,
//       ${user_id} 
//       ${consumer_key} 
//       ${consumer_secret} 
//       ${key_permissions}`
//         });

//       })
//       .catch(error => {
//         console.error('Error making API request:', error.message);

//         return res.status(500).json({ message: error.message });


//       });


//   } catch (error) {
//     return res.status(500).json({
//       message: `${error.messageurl} ${url} , ,
//       ${user_id} 
//       ${consumer_key} 
//       ${consumer_secret} 
//       ${key_permissions}`
//     });
//   }
// };
exports.centralAchatAuth = async (req, res) => {
  const { url, key_id, user_id, consumer_key, consumer_secret, key_permissions } = req.body;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key_id,
        user_id,
        consumer_key,
        consumer_secret,
        key_permissions,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Assuming the response is HTML
    const htmlContent = await response.text();
    console.log('HTML Response:', htmlContent);

    // Render the HTML content as a webpage
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error making API request:', error.message);

    return res.status(500).json({
      message: `API Error: ${error.message}, URL: ${url}, User ID: ${user_id}, Consumer Key: ${consumer_key}, Consumer Secret: ${consumer_secret}, Key Permissions: ${key_permissions}`,
    });
  }
};


exports.profile = async (req, res) => { };
