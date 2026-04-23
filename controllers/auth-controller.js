const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const twilio = require('twilio');
const { verifyGoogleToken } = require("../middleware/google-auth");
require("dotenv").config();

// Initialize Twilio client
let twilioClient;
try {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (error) {
  console.error('Error initializing Twilio client:', error.message);
}

// Function to send welcome SMS
const sendWelcomeSMS = async (phoneNumber, name) => {
  if (!twilioClient) {
    console.error('Twilio client not initialized. SMS not sent.');
    return;
  }

  try {
    await twilioClient.messages.create({
      body: `Bienvenue ${name} sur notre plateforme! Nous sommes ravis de vous avoir parmi nous.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Welcome SMS sent successfully');
  } catch (error) {
    console.error('Error sending welcome SMS:', error.message);
  }
};

// Function to send welcome email using cPanel SMTP
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "🎉 Bienvenue sur ALPHA-NEW COACHING - Votre parcours commence maintenant !",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur ALPHA-NEW COACHING</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
              <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                Bienvenue sur ALPHA-NEW COACHING
              </h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Bonjour ${name} ! 👋
              </h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Nous sommes <strong>ravis</strong> de vous accueillir dans la communauté ALPHA-NEW COACHING ! 🚀
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #38b6ff; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">✅ Votre compte a été créé avec succès</h3>
                <p style="color: #555555; margin: 0; font-size: 14px;">
                  Vous pouvez maintenant vous connecter et commencer à utiliser nos services de coaching professionnel.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://alphanew.coach" 
                   style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 25px; 
                          font-weight: 600; 
                          font-size: 16px; 
                          display: inline-block; 
                          box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);
                          transition: all 0.3s ease;">
                  🚀 Commencer mon parcours
                </a>
              </div>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Notre équipe est là pour vous accompagner dans votre développement professionnel et personnel. 
                N'hésitez pas à nous contacter si vous avez des questions !
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
                  L'équipe ALPHA-NEW COACHING
                </h3>
                <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
                  Votre partenaire pour l'excellence professionnelle
                </p>
              </div>
              
              <!-- Contact Info -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📞 Nous appeler</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">+243 993328512</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📍 Adresse</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">Kinshasa, RDC</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📧 Email</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">
                    <a href="mailto:get.alphanewcoach@gmail.com" style="color: #38b6ff; text-decoration: none;">
                      get.alphanewcoach@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              
              <!-- Social Links -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://alphanew.coach" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🌐 Site Web
                </a>
                <a href="https://alphanew.coach/contact" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  💬 Contact
                </a>
                <a href="https://alphanew.coach/services" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🎯 Services
                </a>
              </div>
              
              <!-- Copyright -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                  © 2025 ALPHA-NEW COACHING - Powered by ALPHA-NEW SARL<br>
                  Tous droits réservés. Développement professionnel et coaching d'excellence.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

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
      role,
      profile_picture,
      cover_picture,
      experience,
      bio,
      qualityCoach,
      project,
      detailsOfProject
    } = req.body;

    let randomImageId = 0;
    let randomProfilePicture = "";

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "L'e-mail existe déjà" });
    }

    if (mobile) {
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res
        .status(409)
        .json({ message: "Le numéro de téléphone existe déjà" });
      }
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
      role,
      profile_picture: profile_picture || randomProfilePicture,
      cover_picture,
      experience,
      bio,
      qualityCoach,
      project,
      detailsOfProject,
      authProvider: 'local'
    });

    // Save the user and get the saved user object
    const savedUser = await newUser.save();

    // Extract the _id from the saved user object
    const savedUserId = savedUser._id;

    // Send welcome SMS
    await sendWelcomeSMS(mobile, name);

    // Send welcome email
    await sendWelcomeEmail(email, name);

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
      experience: foundUser.experience,
      bio: foundUser.bio,
      project: foundUser.project,
      detailsOfProject: foundUser.detailsOfProject,
      province: foundUser.province,
      ville: foundUser.ville,
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


exports.loginGoogle = async (req, res) => {
  try {
    const { email, name, imageUrl, idToken } = req.body;
    
    // Verify the Google ID token
    const verification = await verifyGoogleToken(idToken);
    
    if (!verification.isValid) {
      return res.status(401).json({
        message: 'Invalid Google token',
        error: verification.error
      });
    }
    
    // Check if the email from token matches the submitted email
    if (verification.user.email !== email) {
      return res.status(401).json({
        message: 'Email mismatch between token and request'
      });
    }
    
    // Check if user exists in your database
    let user = await User.findOne({ email: email });
    
    if (!user) {
      // Create new user with Google data
      user = await User.create({
        email: verification.user.email,
        name: verification.user.name,
        imageUrl: verification.user.picture,
        profile_picture: verification.user.picture,
        googleId: verification.user.googleId,
        emailVerified: verification.user.emailVerified,
        authProvider: 'google',
        status: 'ACTIVATED', // Activate Google users by default
        // Set default role or let them choose later
        role: 'COACHE' // or determine based on your logic
      });
    } else {
      // Update existing user's Google info
      user.googleId = verification.user.googleId;
      user.imageUrl = verification.user.picture;
      user.profile_picture = verification.user.picture;
      user.emailVerified = verification.user.emailVerified;
      user.authProvider = 'google';
      user.status = 'ACTIVATED';
      await user.save();
    }
    
    // Generate your application's JWT token
    const SECRET_KEY = process.env.SECRET_KEY;
    const userData = {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      sex: user.sex,
      role: user.role,
      username: user.username,
      profile_picture: user.profile_picture || user.imageUrl,
      cover_picture: user.cover_picture,
      experience: user.experience,
      bio: user.bio,
      project: user.project,
      detailsOfProject: user.detailsOfProject,
      province: user.province,
      ville: user.ville,
    };

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl || user.profile_picture,
        role: user.role
      },
      token: token,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      message: 'Internal server error during Google authentication'
    });
  }
};

/** Google Identity Services often posts `credential` (JWT) only; normalize then reuse loginGoogle. */
exports.exchangeGoogleToken = async (req, res) => {
  const idToken = req.body.idToken || req.body.credential || req.body.token;
  if (!idToken) {
    return res.status(400).json({
      message: 'Missing Google id token (send idToken, credential, or token)'
    });
  }
  const verification = await verifyGoogleToken(idToken);
  if (!verification.isValid) {
    return res.status(401).json({
      message: 'Invalid Google token',
      error: verification.error
    });
  }
  req.body.idToken = idToken;
  req.body.email = req.body.email || verification.user.email;
  req.body.name = req.body.name || verification.user.name;
  req.body.imageUrl = req.body.imageUrl || verification.user.picture;
  return exports.loginGoogle(req, res);
};

exports.registerGoogle = async (req, res) => {
  try {
    const { email, name, imageUrl, idToken, role, project, detailsOfProject } = req.body;
    
    // Verify the Google ID token
    const verification = await verifyGoogleToken(idToken);
    
    if (!verification.isValid) {
      return res.status(401).json({
        message: 'Invalid Google token'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists. Please login instead.'
      });
    }
    
    // Create new user
    const user = await User.create({
      email: verification.user.email,
      name: verification.user.name,
      imageUrl: verification.user.picture,
      profile_picture: verification.user.picture,
      googleId: verification.user.googleId,
      emailVerified: verification.user.emailVerified,
      authProvider: 'google',
      status: 'ACTIVATED',
      role: role || 'COACHE',
      project: project,
      detailsOfProject: detailsOfProject
    });
    
    // Generate your application's JWT token
    const SECRET_KEY = process.env.SECRET_KEY;
    const userData = {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      sex: user.sex,
      role: user.role,
      username: user.username,
      profile_picture: user.profile_picture,
      cover_picture: user.cover_picture,
      experience: user.experience,
      bio: user.bio,
      project: user.project,
      detailsOfProject: user.detailsOfProject,
      province: user.province,
      ville: user.ville,
    };

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role
      },
      token: token,
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({
      message: 'Internal server error during Google registration'
    });
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
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "🔒 Réinitialisation de votre mot de passe ALPHA-NEW COACHING",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation mot de passe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
              <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🔒 Réinitialisation de mot de passe
              </h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Bonjour ${user.name} ! 👋
              </h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ALPHA-NEW COACHING.
              </p>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⏰ Important</h4>
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  Ce lien de réinitialisation expirera dans <strong>1 heure</strong> pour votre sécurité.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 25px; 
                          font-weight: 600; 
                          font-size: 16px; 
                          display: inline-block; 
                          box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);">
                  🔑 Réinitialiser mon mot de passe
                </a>
              </div>
              
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 16px;">🛡️ Vous n'avez pas demandé cette réinitialisation ?</h4>
                <p style="color: #721c24; margin: 0; font-size: 14px;">
                  Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email en toute sécurité. 
                  Votre compte reste protégé.
                </p>
              </div>
              
              <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                <strong>Lien de réinitialisation :</strong><br>
                <span style="font-family: monospace; background-color: #f8f9fa; padding: 5px; border-radius: 4px; word-break: break-all;">${resetLink}</span>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
                  L'équipe ALPHA-NEW COACHING
                </h3>
                <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
                  Votre partenaire pour l'excellence professionnelle
                </p>
              </div>
              
              <!-- Contact Info -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📞 Nous appeler</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">+243 993328512</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📍 Adresse</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">Kinshasa, RDC</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📧 Email</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">
                    <a href="mailto:get.alphanewcoach@gmail.com" style="color: #38b6ff; text-decoration: none;">
                      get.alphanewcoach@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              
              <!-- Copyright -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                  © 2025 ALPHA-NEW COACHING - Powered by ALPHA-NEW SARL<br>
                  Tous droits réservés. Email automatisé de sécurité.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("E-mail de réinitialisation envoyé: " + user.email);
    return res
      .status(200)
      .json({ message: "E-mail de réinitialisation envoyé avec succès" });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPasswordByCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Cet email n'existe pas dans le système" });
    }

    // Save the user with the reset token and expiration
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "🔐 Code de réinitialisation ALPHA-NEW COACHING",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de réinitialisation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
              <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🔐 Code de Réinitialisation
              </h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Bonjour ${user.name} ! 👋
              </h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Vous avez demandé la réinitialisation de votre mot de passe ALPHA-NEW COACHING. 
                Voici votre code de vérification sécurisé :
              </p>
              
              <!-- Code Box -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                           color: #ffffff; 
                           font-size: 32px; 
                           font-weight: 700; 
                           padding: 20px 40px; 
                           border-radius: 15px; 
                           display: inline-block; 
                           letter-spacing: 3px;
                           box-shadow: 0 8px 25px rgba(56, 182, 255, 0.4);
                           font-family: monospace;">
                  ${code}
                </div>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📝 Instructions</h4>
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  Entrez ce code dans l'application pour réinitialiser votre mot de passe. 
                  Le code est valide pendant une durée limitée.
                </p>
              </div>
              
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 16px;">🛡️ Sécurité</h4>
                <p style="color: #721c24; margin: 0; font-size: 14px;">
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                  Votre compte reste sécurisé et aucune action n'est requise.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://alphanew.coach" 
                   style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 25px; 
                          font-weight: 600; 
                          font-size: 16px; 
                          display: inline-block; 
                          box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);">
                  🌐 Retour à ALPHA-NEW COACHING
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
                  L'équipe ALPHA-NEW COACHING
                </h3>
                <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
                  Votre partenaire pour l'excellence professionnelle
                </p>
              </div>
              
              <!-- Contact Info -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📞 Nous appeler</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">+243 993328512</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📍 Adresse</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">Kinshasa, RDC</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📧 Email</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">
                    <a href="mailto:get.alphanewcoach@gmail.com" style="color: #38b6ff; text-decoration: none;">
                      get.alphanewcoach@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              
              <!-- Social Links -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://alphanew.coach" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🌐 Site Web
                </a>
                <a href="https://alphanew.coach/contact" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  💬 Contact
                </a>
                <a href="https://alphanew.coach/services" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🎯 Services
                </a>
              </div>
              
              <!-- Copyright -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                  © 2025 ALPHA-NEW COACHING - Powered by ALPHA-NEW SARL<br>
                  Tous droits réservés. Code de sécurité automatisé.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("E-mail de réinitialisation avec code envoyé: " + user.email);
    return res
      .status(200)
      .json({ message: "E-mail de réinitialisation envoyé avec succès" });
  } catch (error) {
    console.error('Error in resetPasswordByCode:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.handleResetPasswordNoToken = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Find the user by ID and check if the reset token is valid
    const user = await User.findById(userId);

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


exports.update = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, mobile, sex, province, ville, bio, experience} = req.body;

    // Find the user by email
    const foundUser = await User.findOne({
      _id: userId
    });

    if (!foundUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const updatedUser = await User.updateOne(
      { _id: userId },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      updatedData: updatedUser,
    });
  
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



exports.testEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const testName = name || "Test User";
    
    // Test email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "🧪 Test Email ALPHA-NEW COACHING - Configuration vérifiée avec succès !",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email ALPHA-NEW COACHING</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
              <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🧪 Test Email Réussi !
              </h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #d4edda; color: #155724; padding: 15px 25px; border-radius: 50px; font-size: 18px; font-weight: 600; border: 2px solid #c3e6cb;">
                  ✅ Configuration SMTP Fonctionnelle
                </div>
              </div>
              
              <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
                Bonjour <span style="color: #38b6ff;">${testName}</span> ! 👋
              </h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                <strong>Félicitations !</strong> Ceci est un email de test pour confirmer que votre configuration SMTP 
                ALPHA-NEW COACHING fonctionne parfaitement. 🎉
              </p>
              
              <!-- Configuration Details -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #38b6ff;">
                <h3 style="color: #333333; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                  <span style="background-color: #38b6ff; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">⚙️</span>
                  Détails de la configuration
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <strong style="color: #38b6ff;">Serveur SMTP:</strong><br>
                    <span style="color: #666; font-family: monospace;">${process.env.SMTP_HOST}</span>
                  </div>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <strong style="color: #38b6ff;">Port:</strong><br>
                    <span style="color: #666; font-family: monospace;">${process.env.SMTP_PORT}</span>
                  </div>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <strong style="color: #38b6ff;">Sécurité:</strong><br>
                    <span style="color: #666;">SSL/TLS ✅</span>
                  </div>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <strong style="color: #38b6ff;">Date d'envoi:</strong><br>
                    <span style="color: #666; font-size: 14px;">${new Date().toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">💡 Que signifie ce test ?</h4>
                <p style="color: #0c5460; margin: 0; font-size: 14px;">
                  Votre backend ALPHA-NEW COACHING peut maintenant envoyer des emails automatiquement pour :
                  les inscriptions, les réinitialisations de mot de passe, et toutes les notifications importantes.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://alphanew.coach" 
                   style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 25px; 
                          font-weight: 600; 
                          font-size: 16px; 
                          display: inline-block; 
                          box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);">
                  🌐 Visiter ALPHA-NEW COACHING
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
                  L'équipe ALPHA-NEW COACHING
                </h3>
                <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
                  Votre partenaire pour l'excellence professionnelle
                </p>
              </div>
              
              <!-- Contact Info -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📞 Nous appeler</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">+243 993328512</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📍 Adresse</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">Kinshasa, RDC</p>
                </div>
                
                <div style="display: inline-block; margin: 0 20px; vertical-align: top;">
                  <h4 style="margin: 0 0 10px 0; color: #38b6ff; font-size: 16px;">📧 Email</h4>
                  <p style="margin: 0; color: #ecf0f1; font-size: 14px;">
                    <a href="mailto:get.alphanewcoach@gmail.com" style="color: #38b6ff; text-decoration: none;">
                      get.alphanewcoach@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              
              <!-- Social Links -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://alphanew.coach" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🌐 Site Web
                </a>
                <a href="https://alphanew.coach/contact" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  💬 Contact
                </a>
                <a href="https://alphanew.coach/services" style="color: #38b6ff; text-decoration: none; margin: 0 15px; font-size: 14px;">
                  🎯 Services
                </a>
              </div>
              
              <!-- Copyright -->
              <div style="border-top: 1px solid #38b6ff; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                  © 2025 ALPHA-NEW COACHING - Powered by ALPHA-NEW SARL<br>
                  Tous droits réservés. Email de test automatisé depuis votre backend.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);

    return res.status(200).json({
      message: "Email de test envoyé avec succès",
      details: {
        recipient: email,
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    
    let errorMessage = "Erreur lors de l'envoi de l'email de test";
    let errorDetails = error.message;
    
    // Provide specific error messages for common issues
    if (error.code === 'EAUTH') {
      errorMessage = "Erreur d'authentification SMTP";
      errorDetails = "Vérifiez vos identifiants SMTP_USER et SMTP_PASS";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Erreur de connexion au serveur SMTP";
      errorDetails = "Vérifiez votre SMTP_HOST et SMTP_PORT";
    } else if (error.code === 'ESOCKET') {
      errorMessage = "Erreur de connexion réseau";
      errorDetails = "Vérifiez votre connexion internet et les paramètres du serveur";
    }

    return res.status(500).json({
      message: errorMessage,
      error: errorDetails,
      smtp_config: {
        host: process.env.SMTP_HOST || "non configuré",
        port: process.env.SMTP_PORT || "non configuré",
        user: process.env.SMTP_USER ? "configuré" : "non configuré",
        pass: process.env.SMTP_PASS ? "configuré" : "non configuré",
        from: process.env.SMTP_FROM || "non configuré"
      }
    });
  }
};

exports.profile = async (req, res) => { };
