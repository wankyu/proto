const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index.jsx', {isLoggedIn: req.session.isLoggedIn});
});
router.get('/:query', (req, res, next) => {
    let query = req.params.query.split('_')[0];
    let root_node_id = query;
    res.render('index.jsx', {rootNodeId: root_node_id, isLoggedIn: req.session.isLoggedIn});
});

module.exports = router;

