const express = require('express');
const router = express.Router();
const codeController = require('../../controllers/compiler/codeController');
<<<<<<< HEAD
const { protect } = require('../../middleware/auth');
const { testPistonConnectivity } = require('../../utils/pistonDiagnostics');
=======
>>>>>>> 3c1227323a527365973dda54f376e9b6df8b2ffb

// Run Code (Execute and return output)
// No authentication required for code execution
router.post('/execute', codeController.executeCode);

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
