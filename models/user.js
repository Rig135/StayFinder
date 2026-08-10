const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//this adds on a username and a password to our userSchema and makes sure they are unique, gives additional methods to use
userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', userSchema);