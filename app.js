const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const sassMiddleware = require('node-sass-middleware');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.engine('jsx', require('express-react-views').createEngine({
    babel: {presets: ['react', 'es2015', 'stage-3']}
}));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: new FileStore({
        path: './.local/session',
    }),
    secret: '!@#temp_proto_secret_string',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));
app.use(sassMiddleware({
    src: path.join(__dirname, 'styles'),
    dest: path.join(__dirname, 'public', 'css'),
    prefix: '/css',
    sourceMap: true,
    outputStyle: 'compressed',
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');//[TODO]
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/node', require('./routes/node'));
app.use('/login', require('./routes/login'));
app.use('/', require('./routes/index'));
//app.use('/react', require('./routes/react_sample'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
