const express = require('express');
const router = express.Router();
const login_controller = require('../controllers/loginController');

router.get('/', login_controller.checkReferer);
router.post('/', login_controller.checkAuthority);

module.exports = router;

