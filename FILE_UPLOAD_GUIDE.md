# File Upload System Documentation

## Overview
This diagnostic backend now includes a comprehensive local file storage system for handling images and attachments. The system supports profile pictures, cover pictures, and general attachments with automatic image processing and optimization.

## 📁 Directory Structure
```
uploads/
├── attachments/     # General file attachments
├── profiles/        # User profile pictures
├── covers/          # User cover pictures
└── temp/           # Temporary files during processing
```

## 🚀 API Endpoints

### Attachment File Uploads

#### Upload Single Attachment
- **POST** `/api/attachement/upload/single`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: Image file (required)
  - `owner`: User ID (optional)
  - `comment`: Description (optional)

**Example:**
```bash
curl -X POST http://localhost:4000/api/attachement/upload/single \
  -F "file=@image.jpg" \
  -F "owner=64a1234567890abcdef123456" \
  -F "comment=Profile document"
```

#### Upload Multiple Attachments
- **POST** `/api/attachement/upload/multiple`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `files`: Array of image files (max 5 files)
  - `owner`: User ID (optional)
  - `comment`: Description (optional)

**Example:**
```bash
curl -X POST http://localhost:4000/api/attachement/upload/multiple \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "owner=64a1234567890abcdef123456"
```

### Profile & Cover Picture Uploads

#### Upload Profile Picture
- **POST** `/api/upload/profile/:userId`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `profile_picture`: Image file (required)

#### Upload Cover Picture
- **POST** `/api/upload/cover/:userId`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `cover_picture`: Image file (required)

#### Delete Profile Picture
- **DELETE** `/api/upload/profile/:userId`

#### Delete Cover Picture
- **DELETE** `/api/upload/cover/:userId`

### Regular Attachment CRUD
- **GET** `/api/attachement/` - Get all attachments
- **GET** `/api/attachement/:id` - Get single attachment
- **POST** `/api/attachement/` - Create attachment record (without file)
- **PUT** `/api/attachement/:id` - Update attachment
- **DELETE** `/api/attachement/:id` - Delete attachment and file

## 📋 File Specifications

### Supported Formats
- **Images**: JPEG, PNG, GIF, WebP, BMP
- **Processing**: All images are automatically converted to JPEG format

### File Size Limits
- **Attachments**: 10MB per file, max 5 files per request
- **Profile Pictures**: 5MB per file
- **Cover Pictures**: 5MB per file

### Image Processing
- **Automatic Optimization**: Images are resized and compressed
- **Max Dimensions**: 1200x1200 pixels (maintains aspect ratio)
- **Quality**: 85% JPEG compression
- **Format**: Progressive JPEG for better loading

## 🔧 Technical Implementation

### Dependencies
```json
{
  "multer": "File upload handling",
  "sharp": "Image processing and optimization", 
  "uuid": "Unique filename generation"
}
```

### File Naming Convention
- **Format**: `{uuid}.jpg`
- **Example**: `f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg`

### Database Schema Updates

#### Attachment Model
```javascript
{
  owner: ObjectId,           // Reference to User
  comment: String,           // File description
  url: String,              // Public URL to access file
  filename: String,         // Actual filename on disk
  originalName: String,     // Original uploaded filename
  mimeType: String,         // File MIME type
  size: Number,             // File size in bytes
  createdAt: Date,
  updatedAt: Date
}
```

#### User Model (existing fields)
```javascript
{
  profile_picture: String,  // URL to profile picture
  cover_picture: String     // URL to cover picture
}
```

### File Access URLs
Files are served as static content:
- **Base URL**: `http://localhost:4000/uploads/`
- **Attachments**: `http://localhost:4000/uploads/attachments/{filename}`
- **Profiles**: `http://localhost:4000/uploads/profiles/{filename}`
- **Covers**: `http://localhost:4000/uploads/covers/{filename}`

## 🛡️ Security Features

### File Validation
- **Type Checking**: Only image files allowed
- **Size Limits**: Enforced per upload type
- **Extension Validation**: Validates file extensions
- **MIME Type Validation**: Checks actual file content

### Error Handling
- **Upload Failures**: Automatic cleanup of partially uploaded files
- **Database Errors**: Files deleted if database save fails
- **Invalid Files**: Rejected with appropriate error messages

### File Management
- **Automatic Cleanup**: Old files removed when updating
- **Unique Names**: UUID-based naming prevents conflicts
- **Path Security**: No directory traversal vulnerabilities

## 📊 Response Formats

### Successful Upload Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "attachment": {
    "_id": "64a1234567890abcdef123456",
    "owner": "64a1234567890abcdef123455",
    "comment": "Document attachment",
    "url": "http://localhost:4000/uploads/attachments/f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg",
    "filename": "f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg",
    "originalName": "document.jpg",
    "mimeType": "image/jpeg",
    "size": 245760,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 10MB."
}
```

## 🧪 Testing Examples

### Frontend JavaScript (Fetch API)
```javascript
// Upload single attachment
const uploadAttachment = async (file, ownerId, comment) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', ownerId);
  formData.append('comment', comment);

  const response = await fetch('/api/attachement/upload/single', {
    method: 'POST',
    body: formData
  });

  return response.json();
};

// Upload profile picture
const uploadProfilePicture = async (userId, file) => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await fetch(`/api/upload/profile/${userId}`, {
    method: 'POST',
    body: formData
  });

  return response.json();
};
```

### React Component Example
```jsx
const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAttachment(file, userId, 'My attachment');
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
# File upload settings (optional, defaults provided)
MAX_FILE_SIZE=10485760        # 10MB in bytes
MAX_FILES_PER_REQUEST=5       # Maximum files per upload
UPLOAD_PATH=./uploads         # Upload directory path
```

### PM2 Configuration
The upload directories are automatically created and managed. No additional PM2 configuration needed.

## 🚨 Troubleshooting

### Common Issues

#### "No file uploaded" Error
- Ensure `Content-Type: multipart/form-data` header
- Check field names match API specification
- Verify file is actually selected

#### "File size too large" Error
- Check file size limits (10MB for attachments, 5MB for profiles/covers)
- Compress images before upload if needed

#### "Only image files are allowed" Error
- Upload only image files (JPEG, PNG, GIF, WebP, BMP)
- Check file extension and MIME type

#### Files not accessible via URL
- Verify uploads directory exists and has proper permissions
- Check static file serving is enabled in Express
- Ensure file was actually uploaded (check uploads directory)

### File System Permissions
```bash
# Set proper permissions for upload directories
chmod 755 uploads/
chmod 755 uploads/attachments/
chmod 755 uploads/profiles/
chmod 755 uploads/covers/
```

### Monitoring Upload Directory Size
```bash
# Check upload directory size
du -sh uploads/

# List recent uploads
ls -la uploads/attachments/ | head -10
```

## 🔄 Maintenance

### Cleanup Old Files
Create a cleanup script for unused files:
```javascript
// cleanup-unused-files.js
const fs = require('fs');
const path = require('path');
const Attachment = require('./models/attachement_model');
const User = require('./models/user-model');

// Run periodic cleanup of orphaned files
const cleanupOrphanedFiles = async () => {
  // Implementation for finding and removing unused files
};
```

### Backup Strategy
- **Database**: Regular MongoDB backups include file metadata
- **Files**: Backup uploads directory separately
- **Restore**: Restore both database and files together

## 📈 Performance Considerations

### Optimization Tips
1. **CDN Integration**: Consider AWS S3 or CloudFront for production
2. **Image Formats**: WebP for better compression (future enhancement)
3. **Lazy Loading**: Implement lazy loading for image galleries
4. **Caching**: Add proper cache headers for static files

### Monitoring
- Monitor disk space usage in uploads directory
- Track upload success/failure rates
- Monitor image processing performance

## 🔒 Production Deployment

### Security Checklist
- [ ] Configure proper file permissions
- [ ] Set up disk space monitoring
- [ ] Implement rate limiting for uploads
- [ ] Add virus scanning for production (optional)
- [ ] Configure HTTPS for secure uploads

### Scaling Considerations
- **File Storage**: Consider cloud storage for large scale
- **Processing**: Implement queue system for image processing
- **CDN**: Use CDN for global file delivery

This file upload system provides a robust foundation for handling images and attachments in your diagnostic backend application.
