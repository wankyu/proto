const url = require('url');
const express = require('express');
const router = express.Router();
const readlineSync = require('readline-sync');
const getArgv = require('../lib/getArgv');

if(process.env.NODE_ENV == 'development') {
    user_name = 'test';
    user_passwd = 'test';
    console.log('Ok: Dev environment');
} else {
    let user_name = getArgv('-u', '--user') || readlineSync.question('Name: ', {});
    let user_passwd = readlineSync.questionNewPassword('Password: ', {
        mask: '',
        min: 6,
        confirmMessage: 'Confirm Password: ',
        limitMessage: 'Not available password. Try another.',
    });
    console.log('Ok');
}

router.get('/', function(req, res, next) {
    let referer_path = url.parse(req.headers.referer || '/').pathname;
    if(req.session.isLoggedIn) {
        req.session.isLoggedIn = false;
        req.session.save(() => {
            res.redirect(referer_path);
        });
    } else {
        console.log('id:::', req.sessionID);
        res.render('login.jsx', {referer: referer_path});
    }
});

router.post('/', function(req, res, next) {
    req.session.username = req.body.username;
    req.session.isLoggedIn = (user_passwd == req.body.password && user_name == req.body.username);
    console.log('id:::', req.sessionID);
    req.session.save(() => {
        //console.log('login:::', req.session);
        res.redirect(req.body.referer);
    });
});

module.exports = router;

