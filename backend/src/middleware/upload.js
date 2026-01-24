const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to save files to disk AND keep buffer for hashing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Memory storage to get buffer for hash generation
const memoryStorage = multer.memoryStorage();

// File filter to allow organizer proof docs (pdf/jpg/png) and student images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
  }
};

// Custom storage that saves to disk but also keeps buffer
const customStorage = {
  _handleFile: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    const filepath = path.join(uploadsDir, filename);
    
    // Collect chunks to create buffer
    const chunks = [];
    
    file.stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    file.stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      
      // Save to disk
      fs.writeFile(filepath, buffer, (err) => {
        if (err) {
          return cb(err);
        }
        
        // Return file info with buffer
        cb(null, {
          buffer: buffer, // Buffer for hashing
          path: filepath,
          filename: filename,
          size: buffer.length
        });
      });
    });
    
    file.stream.on('error', cb);
  },
  _removeFile: function (req, file, cb) {
    fs.unlink(file.path, cb);
  }
};

// Multer upload configuration with custom storage
const upload = multer({
  storage: customStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per requirements
  },
  fileFilter: fileFilter,
});

module.exports = upload;
