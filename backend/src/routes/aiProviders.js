const express = require('express');
const router = express.Router();
const AIProviderController = require('../controllers/aiProviderController');

router.post('/', AIProviderController.create);
router.get('/', AIProviderController.getAll);
router.get('/active', AIProviderController.getActive);
router.put('/:id', AIProviderController.update);
router.delete('/:id', AIProviderController.delete);
router.patch('/:id/active', AIProviderController.setActive);

module.exports = router;
