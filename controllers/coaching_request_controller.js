const CoachingRequest = require("../models/coaching_request_model");
const User = require("../models/user-model");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Use SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email template for coach notification (new request)
const getCoachNewRequestEmailTemplate = (coachName, coacheeName, coacheeEmail, message, requestId) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle demande de coaching - ALPHA-NEW COACHING</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
          <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            📩 Nouvelle Demande de Coaching
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            Bonjour ${coachName} ! 👋
          </h2>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Vous avez reçu une nouvelle demande de coaching de la part de <strong>${coacheeName}</strong>.
          </p>
          
          <!-- Request Details -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #38b6ff;">
            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">
              📝 Message du coaché :
            </h3>
            <p style="color: #555555; font-style: italic; margin: 0; font-size: 16px; line-height: 1.5;">
              "${message}"
            </p>
          </div>
          
          <!-- Coachee Info -->
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">👤 Informations du coaché</h4>
            <p style="color: #856404; margin: 5px 0; font-size: 14px;">
              <strong>Nom :</strong> ${coacheeName}<br>
              <strong>Email :</strong> ${coacheeEmail}
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://alphanew.coach/coach-dashboard?tab=requests" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block; 
                      margin: 10px;
                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">
              ✅ Voir et Répondre
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
            Connectez-vous à votre tableau de bord pour accepter ou décliner cette demande.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
            L'équipe ALPHA-NEW COACHING
          </h3>
          <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
            Votre partenaire pour l'excellence professionnelle
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for coachee notification (request sent)
const getCoacheeRequestSentEmailTemplate = (coacheeName, coachName, message) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demande envoyée - ALPHA-NEW COACHING</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); padding: 30px 20px; text-align: center;">
          <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ✅ Demande Envoyée
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            Bonjour ${coacheeName} ! 👋
          </h2>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Votre demande de coaching a été envoyée avec succès à <strong>${coachName}</strong>.
          </p>
          
          <!-- Request Summary -->
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">
              📝 Votre message :
            </h3>
            <p style="color: #155724; font-style: italic; margin: 0; font-size: 16px; line-height: 1.5;">
              "${message}"
            </p>
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">⏳ Prochaines étapes</h4>
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              Votre coach examinera votre demande et vous répondra sous peu. Vous recevrez une notification par email dès qu'une réponse sera disponible.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://alphanew.coach/dashboard" 
               style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block; 
                      box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);">
              📊 Voir mon Tableau de Bord
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
            L'équipe ALPHA-NEW COACHING
          </h3>
          <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
            Votre partenaire pour l'excellence professionnelle
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for coachee (request accepted)
const getCoacheeRequestAcceptedEmailTemplate = (coacheeName, coachName, coachEmail, responseMessage) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demande acceptée - ALPHA-NEW COACHING</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
          <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🎉 Demande Acceptée !
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            Excellente nouvelle ${coacheeName} ! 🎊
          </h2>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${coachName}</strong> a accepté votre demande de coaching ! Votre parcours d'accompagnement peut maintenant commencer.
          </p>
          
          ${responseMessage ? `
          <!-- Coach Response -->
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">
              💬 Message de votre coach :
            </h3>
            <p style="color: #155724; font-style: italic; margin: 0; font-size: 16px; line-height: 1.5;">
              "${responseMessage}"
            </p>
          </div>
          ` : ''}
          
          <!-- Coach Contact Info -->
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📞 Contact de votre coach</h4>
            <p style="color: #856404; margin: 5px 0; font-size: 14px;">
              <strong>Nom :</strong> ${coachName}<br>
              <strong>Email :</strong> ${coachEmail}
            </p>
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">🚀 Prochaines étapes</h4>
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              Votre coach vous contactera prochainement pour planifier votre première session. Vous pouvez également le contacter directement pour toute question.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://alphanew.coach/dashboard" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block; 
                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">
              🎯 Commencer mon Coaching
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
            L'équipe ALPHA-NEW COACHING
          </h3>
          <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
            Votre partenaire pour l'excellence professionnelle
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for coachee (request rejected)
const getCoacheeRequestRejectedEmailTemplate = (coacheeName, coachName, responseMessage) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réponse à votre demande - ALPHA-NEW COACHING</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px 20px; text-align: center;">
          <img src="https://alphanew.coach/assets/logo.png" alt="ALPHA-NEW COACHING Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            📋 Réponse à votre Demande
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            Bonjour ${coacheeName} ! 👋
          </h2>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${coachName}</strong> a examiné votre demande de coaching et a envoyé la réponse suivante :
          </p>
          
          ${responseMessage ? `
          <!-- Coach Response -->
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">
              💬 Message de ${coachName} :
            </h3>
            <p style="color: #856404; font-style: italic; margin: 0; font-size: 16px; line-height: 1.5;">
              "${responseMessage}"
            </p>
          </div>
          ` : ''}
          
          <!-- Encouragement -->
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">💪 Ne vous découragez pas !</h4>
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              Il existe de nombreux autres coachs expérimentés sur notre plateforme. Continuez à explorer et trouvez le coach qui correspond parfaitement à vos besoins.
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://alphanew.coach/coaches" 
               style="background: linear-gradient(135deg, #38b6ff 0%, #02093d 100%); 
                      color: #ffffff; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block; 
                      margin: 10px;
                      box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);">
              🔍 Trouver d'autres Coachs
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #02093d; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #ecf0f1;">
            L'équipe ALPHA-NEW COACHING
          </h3>
          <p style="margin: 0; font-size: 14px; color: #bdc3c7;">
            Votre partenaire pour l'excellence professionnelle
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email utility function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// 1. Create Coaching Request
exports.createCoachingRequest = async (req, res) => {
  try {
    const { coach, message } = req.body;
    const coachee = req.body.coachee; // From authenticated user or request body

    // Validate required fields
    if (!coach || !coachee) {
      return res.status(400).json({ 
        success: false,
        message: "Coach and coachee IDs are required" 
      });
    }

    // Check if coach and coachee exist
    const [coachUser, coacheeUser] = await Promise.all([
      User.findById(coach),
      User.findById(coachee)
    ]);

    if (!coachUser) {
      return res.status(404).json({ 
        success: false,
        message: "Coach not found" 
      });
    }

    if (!coacheeUser) {
      return res.status(404).json({ 
        success: false,
        message: "Coachee not found" 
      });
    }

    // Check for existing pending or re-request
    const existingRequest = await CoachingRequest.findOne({
      coach,
      coachee,
      status: { $in: ['pending', 're-request'] }
    });

    if (existingRequest) {
      return res.status(409).json({ 
        success: false,
        message: "Une demande est déjà en cours avec ce coach" 
      });
    }

    // Create new coaching request
    const newRequest = new CoachingRequest({
      coach,
      coachee,
      message: message || "Je souhaiterais bénéficier de votre accompagnement en coaching.",
      status: 'pending'
    });

    const savedRequest = await newRequest.save();

    // Populate the request with user details
    const populatedRequest = await CoachingRequest.findById(savedRequest._id)
      .populate('coach', 'name email')
      .populate('coachee', 'name email');

    // Send email to coach
    await sendEmail(
      coachUser.email,
      "🔔 Nouvelle demande de coaching - ALPHA-NEW COACHING",
      getCoachNewRequestEmailTemplate(
        coachUser.name,
        coacheeUser.name,
        coacheeUser.email,
        message || "Je souhaiterais bénéficier de votre accompagnement en coaching.",
        savedRequest._id
      )
    );

    // Send confirmation email to coachee
    await sendEmail(
      coacheeUser.email,
      "✅ Demande de coaching envoyée - ALPHA-NEW COACHING",
      getCoacheeRequestSentEmailTemplate(
        coacheeUser.name,
        coachUser.name,
        message || "Je souhaiterais bénéficier de votre accompagnement en coaching."
      )
    );

    return res.status(201).json({
      success: true,
      message: "Demande de coaching créée avec succès",
      data: populatedRequest
    });

  } catch (error) {
    console.error('Error creating coaching request:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 2. Update Coaching Request Status (Accept/Reject)
exports.updateCoachingRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, responseMessage } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Status must be 'accepted' or 'rejected'" 
      });
    }

    // Find the request
    const request = await CoachingRequest.findById(requestId)
      .populate('coach', 'name email')
      .populate('coachee', 'name email');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Demande de coaching non trouvée" 
      });
    }

    if (request.status !== 'pending' && request.status !== 're-request') {
      return res.status(400).json({ 
        success: false,
        message: "Cette demande a déjà été traitée" 
      });
    }

    // Update the request
    request.status = status;
    request.responseMessage = responseMessage;
    request.respondedAt = new Date();

    const updatedRequest = await request.save();

    // Send appropriate email to coachee
    if (status === 'accepted') {
      await sendEmail(
        request.coachee.email,
        "🎉 Votre demande de coaching a été acceptée - ALPHA-NEW COACHING",
        getCoacheeRequestAcceptedEmailTemplate(
          request.coachee.name,
          request.coach.name,
          request.coach.email,
          responseMessage
        )
      );
    } else {
      await sendEmail(
        request.coachee.email,
        "📋 Réponse à votre demande de coaching - ALPHA-NEW COACHING",
        getCoacheeRequestRejectedEmailTemplate(
          request.coachee.name,
          request.coach.name,
          responseMessage
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: `Demande ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error updating coaching request status:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 3. Re-request After Rejection
exports.reRequestCoaching = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;

    // Find the request
    const request = await CoachingRequest.findById(requestId)
      .populate('coach', 'name email')
      .populate('coachee', 'name email');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Demande de coaching non trouvée" 
      });
    }

    if (request.status !== 'rejected') {
      return res.status(400).json({ 
        success: false,
        message: "Seules les demandes rejetées peuvent être renouvelées" 
      });
    }

    // Update the request
    request.status = 're-request';
    request.message = message || request.message;
    request.reRequestedAt = new Date();
    request.responseMessage = null; // Clear previous response
    request.respondedAt = null;

    const updatedRequest = await request.save();

    // Send email to coach about re-request
    await sendEmail(
      request.coach.email,
      "🔄 Nouvelle demande de coaching (renouvelée) - ALPHA-NEW COACHING",
      getCoachNewRequestEmailTemplate(
        request.coach.name,
        request.coachee.name,
        request.coachee.email,
        message || request.message,
        requestId
      )
    );

    // Send confirmation to coachee
    await sendEmail(
      request.coachee.email,
      "🔄 Demande renouvelée avec succès - ALPHA-NEW COACHING",
      getCoacheeRequestSentEmailTemplate(
        request.coachee.name,
        request.coach.name,
        message || request.message
      )
    );

    return res.status(200).json({
      success: true,
      message: "Demande renouvelée avec succès",
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error re-requesting coaching:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 4. Cancel Coaching Request
exports.cancelCoachingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find and delete the request
    const request = await CoachingRequest.findById(requestId)
      .populate('coach', 'name email')
      .populate('coachee', 'name email');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Demande de coaching non trouvée" 
      });
    }

    if (request.status === 'accepted') {
      return res.status(400).json({ 
        success: false,
        message: "Impossible d'annuler une demande déjà acceptée" 
      });
    }

    await CoachingRequest.findByIdAndDelete(requestId);

    // Optionally send cancellation email to coach
    await sendEmail(
      request.coach.email,
      "❌ Demande de coaching annulée - ALPHA-NEW COACHING",
      `
        <p>Bonjour ${request.coach.name},</p>
        <p>La demande de coaching de <strong>${request.coachee.name}</strong> a été annulée.</p>
        <p>Cordialement,<br>L'équipe ALPHA-NEW COACHING</p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "Demande de coaching annulée avec succès"
    });

  } catch (error) {
    console.error('Error canceling coaching request:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 5. Get Coach's Requests
exports.getCoachRequests = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { coach: coachId };
    if (status) {
      filter.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'coachee', select: 'name email profile_picture' },
        { path: 'coach', select: 'name email' }
      ]
    };

    const requests = await CoachingRequest.find(filter)
      .populate('coachee', 'name email profile_picture')
      .populate('coach', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CoachingRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting coach requests:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 6. Get Coachee's Requests
exports.getCoacheeRequests = async (req, res) => {
  try {
    const { coacheeId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { coachee: coacheeId };
    if (status) {
      filter.status = status;
    }

    const requests = await CoachingRequest.find(filter)
      .populate('coach', 'name email profile_picture bio experience qualityCoach')
      .populate('coachee', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CoachingRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting coachee requests:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 7. Get All Requests (Admin)
exports.getAllCoachingRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await CoachingRequest.find(filter)
      .populate('coach', 'name email profile_picture')
      .populate('coachee', 'name email profile_picture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CoachingRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting all coaching requests:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 8. Get Single Request Details
exports.getCoachingRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await CoachingRequest.findById(requestId)
      .populate('coach', 'name email profile_picture bio experience qualityCoach')
      .populate('coachee', 'name email profile_picture');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Demande de coaching non trouvée" 
      });
    }

    return res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error getting coaching request by ID:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
