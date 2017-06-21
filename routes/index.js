const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index.jsx', { title: 'Test' });
});

module.exports = router;

