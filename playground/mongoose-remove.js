const {ObjectID} = require('mongodb');

const {mongoose} = require('mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

//remove all documents in todos collection
// Todo.remove({}).then((result)=>{
//     console.log(result);
// })

//remove documents according to the provided condition
// Todo.remove({_id: new ObjectID('5ae8033126cdbff41921eec7')}).then((result)=>{
//     console.log(result);
// })

//or

//remove documents according to the provided condition
// Todo.remove({_id: '5ae8033126cdbff41921eec7'}).then((result)=>{
//     console.log(result);
// })

//find the first matching document according to the provided search criteria and remove it from the collection
// Todo.findOneAndRemove({completed: false}).then((result)=>{
//     console.log(result);
// })

//find a document by id and remove it from the collection,
//id is provided as string instead of ObjectID object
// Todo.findByIdAndRemove('5ae8033226cdbff41921eec9').then((result)=>{
//     console.log(result);
// })
