var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

// User.authenticate() is a mongoose-passport plugin
// If we are not using this, we have to write out own 
// authentication funciton.
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// For sessions to track the clients, we serialize and
// deserialize them.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create signed token
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 36000 }); //seconds
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

// For Admin/ Non-Admin
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin)
        next();

    else {
        var err = new Error('Only admin can do it');
        err.status = 403;
        return next(err);
    }
};