const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  uploadFile,
  uploadMultipleFiles,
} = require("../controllers/attachement_controller");
const { 
  attachmentUpload, 
  processImage, 
  handleUploadError 
} = require("../middleware/upload");

// Regular CRUD routes
router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// File upload routes
router.post(
  "/upload/single",
  attachmentUpload.single('file'),
  processImage,
  handleUploadError,
  uploadFile
);

router.post(
  "/upload/multiple", 
  attachmentUpload.array('files', 5),
  processImage,
  handleUploadError,
  uploadMultipleFiles
);

module.exports = router;
