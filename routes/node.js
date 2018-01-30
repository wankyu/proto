const express = require('express');
const router = express.Router();
const node_controller = require('../controllers/nodeController');

router.post('/', node_controller.create);
router.get('/', node_controller.getAll);
router.post('/:id', node_controller.update);
router.get('/:id', node_controller.get);
router.delete('/:id', node_controller.delete);

module.exports = router;

