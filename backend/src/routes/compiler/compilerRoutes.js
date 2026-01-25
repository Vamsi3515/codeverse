const express = require('express');
const router = express.Router();
const codeController = require('../../controllers/compiler/codeController');
const { protect } = require('../../middleware/auth');

// Run Code (Execute and return output)
// Protected to prevent abuse, but can be open if needed for simple demos
router.post('/execute', protect, codeController.executeCode);

module.exports = router;
