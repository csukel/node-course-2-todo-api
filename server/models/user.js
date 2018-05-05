const {mongoose} = require('../db/mongoose')
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema( {
    email: {
        required: true,
        type: String,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
        
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id','email']);
};

//instance methods
//we need to bind this (context operator) hence we use a function instead of arrow function
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(),access},'abc123').toString();

    // user.tokens.push({access,token});
    user.tokens = user.tokens.concat([{access,token}]);
    return user.save()
        .then(()=>{
            return token;
        },(e)=>{
            return e;
        })
        .catch((e)=>{
            return e;
        });

};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token,'abc123');
    }catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token':token,
        'tokens.access': 'auth'
    });
}

UserSchema.pre('save',function(next){
    var user = this;
    if (user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            if (err){
                return Promise.reject('Could not hash password')
            }
            bcrypt.hash(user.password,salt,(err,hashedPassword)=>{
                if (err){
                    return Promise.reject('Could not hash the password')
                }
                user.password = hashedPassword;
                next();
            })
        })
    }else {
        next();
    }
    

});

var User = mongoose.model('User', UserSchema );

module.exports = {User};
