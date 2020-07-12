var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var FileStore = require('session-file-store')(session);

var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//ROUTERS
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');

//* DB CONNECTION OF REST API
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

// Set-up the connection with the server
//const url = 'mongodb://localhost:27017/conFusion';
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });
//* DB TO REST API DONE.

var app = express();
// To redirect into HTTPS port (3443) 
// app.all('*', (req, res, next) => {
//   if (req.secure) {
//     return next();
//   }
//   else {
//     res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
//   }
// });


//* view engine setup
// Serve the HTML files from the public folder
// This STATEMENT 'alone' does the FS+PATH functionary
// as we did in node-http module.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Signed cookie parser, we use. So enter any SECRET Key
// app.use(cookieParser('12345-67890-09876-54321'));

// EXPRESS-SESSION instead of COOKIES
// app.use(session({
//   name: 'session-id',
//   // any random string
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }));
app.use(passport.initialize());
// app.use(passport.session());

// ROUTES GO HERE
app.use('/', indexRouter);
app.use('/users', usersRouter);


// To serve the static view files on our system.
// So, its better to perform BASIC AUTHENTICATION before this.
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES GO HERE
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//* SERVER IS SETUP AND RUN in bin > www file.