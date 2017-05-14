var express = require('express');
var router = express.Router();
var React = require('react');
var {renderToString} = require('react-dom/server');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('react_sample.jsx', {title:'sample', name: 'Test' });
});

router.get('/api/*', (req, res) => {
    res.send('asdf');
});

module.exports = router;
