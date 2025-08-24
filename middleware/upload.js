const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize upload directories
const uploadDirs = [
  'uploads/attachments',
  'uploads/profiles', 
  'uploads/covers',
  'uploads/temp'
];

uploadDirs.forEach(ensureUploadDir);

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Storage configuration for different upload types
const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', destination);
      ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

// Multer configurations for different upload types
const attachmentUpload = multer({
  storage: createStorage('uploads/attachments'),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

const profileUpload = multer({
  storage: createStorage('uploads/profiles'),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file only
  }
});

const coverUpload = multer({
  storage: createStorage('uploads/covers'),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file only
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file && file.mimetype.startsWith('image/')) {
        const originalPath = file.path;
        const processedPath = originalPath.replace(path.extname(originalPath), '_processed.jpg');
        
        // Process image with Sharp
        await sharp(originalPath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toFile(processedPath);

        // Replace original file with processed version
        fs.unlinkSync(originalPath);
        fs.renameSync(processedPath, originalPath);

        // Update file info
        file.filename = file.filename.replace(path.extname(file.filename), '.jpg');
        file.mimetype = 'image/jpeg';
        
        processedFiles.push(file);
      }
    }

    // Update req.files with processed files
    if (req.files) {
      req.files = processedFiles;
    } else if (req.file) {
      req.file = processedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'File upload error occurred.',
    error: error.message
  });
};

// Generate file URL helper
const generateFileUrl = (req, filename, type = 'attachments') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Delete file helper
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  attachmentUpload,
  profileUpload,
  coverUpload,
  processImage,
  handleUploadError,
  generateFileUrl,
  deleteFile,
  ensureUploadDir
};
