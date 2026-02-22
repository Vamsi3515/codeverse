const express = require('express');
const router = express.Router();
const codeController = require('../../controllers/compiler/codeController');

// Run Code (Execute and return output)
// No authentication required for code execution
router.post('/execute', codeController.executeCode);

module.exports = router;
