var {mongoose} = require('../db/mongoose')

var User = mongoose.model('User', {
    email: {
        required: true,
        type: String,
        trim: true,
        minlength: 1
    }
});

module.exports = {User};

// var newUser = new User({
//     email: 'l.stylianou@ams.com.cy'
// });

// newUser.save()
//     .then((doc)=>{
//         console.log(JSON.stringify(doc,undefined,2));
//     })
//     .catch((err)=>{
//         console.log('Unable to save user',err);
//     })