const Attachement = require("../models/attachement_model");
const { generateFileUrl, deleteFile } = require("../middleware/upload");
const path = require("path");

exports.findAll = async (req, res) => {
  try {
    const projects = await Attachement.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "owner, comment, url",
    // });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Attachement.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Attachement non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Upload single attachment file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded" 
      });
    }

    const fileUrl = generateFileUrl(req, req.file.filename, 'attachments');
    
    const attachmentData = {
      owner: req.body.owner,
      comment: req.body.comment || '',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    const newAttachment = new Attachement(attachmentData);
    const savedAttachment = await newAttachment.save();
    
    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      attachment: savedAttachment
    });
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Upload multiple attachment files
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No files uploaded" 
      });
    }

    const attachments = [];
    
    for (const file of req.files) {
      const fileUrl = generateFileUrl(req, file.filename, 'attachments');
      
      const attachmentData = {
        owner: req.body.owner,
        comment: req.body.comment || '',
        url: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      };

      const newAttachment = new Attachement(attachmentData);
      const savedAttachment = await newAttachment.save();
      attachments.push(savedAttachment);
    }
    
    return res.status(201).json({
      success: true,
      message: `${attachments.length} files uploaded successfully`,
      attachments: attachments
    });
  } catch (error) {
    // Delete uploaded files if database save fails
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newAttachment = new Attachement(req.body);
    const savedAttachment = await newAttachment.save();
    return res.status(201).json({
      success: true,
      message: "Attachment created successfully",
      attachment: savedAttachment
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Attachement.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Attachement non trouvé" });
    }

    const updatedProject = await Attachement.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Attachement mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const foundAttachment = await Attachement.findOne({ _id: req.params.id });
    if (!foundAttachment) {
      return res.status(404).json({ 
        success: false,
        error: "Attachement non trouvé !" 
      });
    }

    // Delete physical file if it exists
    if (foundAttachment.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'attachments', foundAttachment.filename);
      deleteFile(filePath);
    }

    const deletedAttachment = await Attachement.findOneAndDelete({ _id: foundAttachment._id });
    
    return res.json({
      success: true,
      message: "Attachement supprimé avec succès",
      deletedData: deletedAttachment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ 
        success: false,
        error: "Attachement non supprimé !", 
        details: error.message 
      });
  }
};
