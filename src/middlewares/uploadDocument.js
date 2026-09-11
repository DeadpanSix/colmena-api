const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fsPromises = require('fs/promises');
const { fileTypeFromBuffer } = require('file-type');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = 'uploads/';

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
  }
  cb(null, true);
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

async function verifyAndSaveFile(req, res, next) {
  if (!req.file) {
    return next();
  }

  try {
    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      return res.status(400).json({
        error: 'File content does not match an allowed type (PDF, JPG, PNG)',
      });
    }

    const randomName = crypto.randomBytes(32).toString('hex');
    const extension = `.${detectedType.ext}`;
    const fileName = `${randomName}${extension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fsPromises.writeFile(filePath, req.file.buffer);

    req.file.path = filePath;
    req.file.filename = fileName;

    next();
  } catch (error) {
    console.error('Error verifying/saving file:', error);
    return res.status(500).json({ error: 'Error processing uploaded file' });
  }
}

module.exports = { upload: multerUpload.single('file'), verifyAndSaveFile };
