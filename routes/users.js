var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

//* GET users listing.
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find({})
    .then((err, users) => {
      if (err) {
        return next(err);
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//* POST ROUTE TO SIGNUP
// Using Passport
router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    });
});

//* POST ROUTE TO LOGIN
// With Passport + JWT
router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

// With PassPort + Sessions
// router.post('/login', passport.authenticate('local'), (req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');
//   res.json({ success: true, status: 'You are successfully logged in!' });
// });

//Earlier function (without passport, Only Sessions)
// router.post('/login', (req, res, next) => {

//   // Check if the user is suthenticated by
//   // Signed Cookies -> SESSION now
//   if (!req.session.user) {
//     // If not, then check the authorization headers
//     var authHeader = req.headers.authorization;

//     // check if Header Authenticated.
//     if (!authHeader) {
//       var err = new Error('You are not authenticated!');
//       res.setHeader('WWW-Authenticate', 'Basic');
//       err.status = 401;
//       return next(err);
//     }
//     // Splitting the incoming Header, take its 2nd element (compulsory) & again split it.
//     // Finally after splitting and all, auth will have Username & Password (encoded).
//     var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//     var username = auth[0];
//     var password = auth[1];

//     User.findOne({ username: username })
//       .then((user) => {
//         if (user === null) {
//           var err = new Error('User ' + username + ' does not exist!');
//           err.status = 403;
//           return next(err);
//         }
//         else if (user.password !== password) {
//           var err = new Error('Your password is incorrect!');
//           err.status = 403;
//           return next(err);
//         }
//         else if (user.username === username && user.password === password) {
//           req.session.user = 'authenticated';
//           res.statusCode = 200;
//           res.setHeader('Content-Type', 'text/plain');
//           res.end('You are authenticated!')
//         }
//       })
//       // If error occurs, pass the error to next, so that
//       // the error handler appropriately handles it.
//       .catch((err) => next(err));
//   }
//   else {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('You are already authenticated!');
//   }
// })


//* GET ROUTE SIGNOUT
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    // Clear the session-id which is the cookie+sessionId = session.
    res.clearCookie('session-id');
    // redirect to Home Page
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
