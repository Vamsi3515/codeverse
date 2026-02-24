const express = require('express');
const router = express.Router();
const codeController = require('../../controllers/compiler/codeController');
const { protect } = require('../../middleware/auth');
const { testPistonConnectivity } = require('../../utils/pistonDiagnostics');

// Run Code (Execute and return output)
// Protected to prevent abuse, but can be open if needed for simple demos
router.post('/execute', protect, codeController.executeCode);

// Diagnostic endpoint - test Piston connectivity (protected for security)
router.get('/diagnostics/piston', protect, async (req, res) => {
  try {
    const result = await testPistonConnectivity();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
