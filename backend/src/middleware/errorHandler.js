exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    let message = 'Duplicate student identity detected';
    
    // Extract the field that caused the duplicate
    const field = Object.keys(err.keyPattern)[0];
    
    // Provide user-friendly messages based on the duplicate field
    if (field === 'regNumber') {
      message = 'This roll number is already registered';
    } else if (field === 'collegeIdCardHash') {
      message = 'This College ID Card has already been used for registration';
    } else if (field === 'selfieHash') {
      message = 'This selfie has already been used for registration';
    } else if (field === 'email') {
      message = 'Email already registered';
    }
    
    error = { 
      message, 
      statusCode: 409, 
      isDuplicate: true,
      duplicateField: field 
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    isDuplicate: error.isDuplicate || false,
    duplicateField: error.duplicateField || undefined,
  });
};

exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
