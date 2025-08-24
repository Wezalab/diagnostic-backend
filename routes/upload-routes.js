const router = require("express").Router();
const { 
  profileUpload, 
  coverUpload, 
  processImage, 
  handleUploadError,
  generateFileUrl,
  deleteFile
} = require("../middleware/upload");
const User = require("../models/user-model");
const path = require("path");

// Profile picture upload
router.post(
  "/profile/:userId",
  profileUpload.single('profile_picture'),
  processImage,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No profile picture uploaded" 
        });
      }

      const userId = req.params.userId;
      const user = await User.findById(userId);
      
      if (!user) {
        // Delete uploaded file if user not found
        deleteFile(req.file.path);
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Delete old profile picture if exists
      if (user.profile_picture) {
        const oldFilename = path.basename(user.profile_picture);
        const oldFilePath = path.join(__dirname, '..', 'uploads', 'profiles', oldFilename);
        deleteFile(oldFilePath);
      }

      const fileUrl = generateFileUrl(req, req.file.filename, 'profiles');
      
      // Update user profile picture
      user.profile_picture = fileUrl;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        profile_picture: fileUrl,
        user: user
      });
    } catch (error) {
      // Delete uploaded file if database update fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }
);

// Cover picture upload
router.post(
  "/cover/:userId",
  coverUpload.single('cover_picture'),
  processImage,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: "No cover picture uploaded" 
        });
      }

      const userId = req.params.userId;
      const user = await User.findById(userId);
      
      if (!user) {
        // Delete uploaded file if user not found
        deleteFile(req.file.path);
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Delete old cover picture if exists
      if (user.cover_picture) {
        const oldFilename = path.basename(user.cover_picture);
        const oldFilePath = path.join(__dirname, '..', 'uploads', 'covers', oldFilename);
        deleteFile(oldFilePath);
      }

      const fileUrl = generateFileUrl(req, req.file.filename, 'covers');
      
      // Update user cover picture
      user.cover_picture = fileUrl;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Cover picture updated successfully",
        cover_picture: fileUrl,
        user: user
      });
    } catch (error) {
      // Delete uploaded file if database update fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }
);

// Delete profile picture
router.delete("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!user.profile_picture) {
      return res.status(400).json({ 
        success: false,
        message: "No profile picture to delete" 
      });
    }

    // Delete physical file
    const filename = path.basename(user.profile_picture);
    const filePath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
    deleteFile(filePath);

    // Update user record
    user.profile_picture = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      user: user
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete cover picture
router.delete("/cover/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!user.cover_picture) {
      return res.status(400).json({ 
        success: false,
        message: "No cover picture to delete" 
      });
    }

    // Delete physical file
    const filename = path.basename(user.cover_picture);
    const filePath = path.join(__dirname, '..', 'uploads', 'covers', filename);
    deleteFile(filePath);

    // Update user record
    user.cover_picture = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cover picture deleted successfully",
      user: user
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
