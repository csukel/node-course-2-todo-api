//sha256

//json web token (JWT)

const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// bcrypt.genSalt(10, (err,salt)=>{
//     bcrypt.hash(password,salt,(err,hash)=>{
//         console.log(hash);
//     })
// })

var hashedPassword = '$2a$10$1sw3MjrMKnCwFtiB625B1u3HQwbCRBJL5D4NBC/G7t1dxNRyd9Ypy';

bcrypt.compare('123!',hashedPassword,(err,res)=>{
    if (err){
        return console.log(err)
    }
    console.log(res);
})


// var data = {
//     id : 10
// }


// var token = jwt.sign(data,'123abc');
// console.log(token);
// var decoded = jwt.verify(token,'123abc');
// console.log(decoded);

// var message = 'I am user number 3';

// var hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);


// var data = {
//     id: 4
// }

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data)+ 'somesecret').toString()
// }

// // data.id =5 

// var resultHash = SHA256(JSON.stringify(data)+ 'somesecret').toString();

// if (resultHash === token.hash){
//     console.log('Data was not changed.')
// }else {
//     console.log('Data was changed. Don\'t trust')
// }