const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.post('/', ChatController.create);
router.get('/', ChatController.getAll);
router.get('/:id', ChatController.getById);
router.get('/:id/messages', ChatController.getMessages);
router.post('/:id/messages', ChatController.sendMessage);
router.put('/:id', ChatController.update);
router.delete('/:id', ChatController.delete);

module.exports = router;
