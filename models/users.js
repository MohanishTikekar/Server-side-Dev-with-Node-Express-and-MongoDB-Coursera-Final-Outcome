var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// this automatically adds username and password to the schema
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// Hashes the password using salt, SHA-256
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);