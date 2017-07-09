const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index.jsx', {isLoggedIn: req.session.isLoggedIn});
});

module.exports = router;

