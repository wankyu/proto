const url = require('url');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session.isLoggedIn) {
        req.session.isLoggedIn = false;
        req.session.save(() => {
            res.redirect('/');
        });
    } else {
        let name = req.session.username || 'none';
        let checkpw = req.session.isLoggedIn || false;
        console.log('id:::', req.sessionID);
        res.render('login.jsx', {test: name, checkpw: checkpw, referer: url.parse(req.headers.referer).pathname});
    }
});

router.post('/', function(req, res, next) {
    req.session.username = req.body.username;
    req.session.isLoggedIn = ('1234' == req.body.password);
    console.log('id:::', req.sessionID);
    req.session.save(() => {
        //console.log('login:::', req.session);
        res.redirect(req.body.referer);
    });
});

module.exports = router;

