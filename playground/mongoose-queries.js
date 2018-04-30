const {ObjectID} = require('mongodb');
const {mongoose} = require('../server/db/mongoose');

const {Todo} = require('../server/models/todo');

// var id = '5ae6ce510bcb09d83337a1ad';
var id = 'sdfd';

if (!ObjectID.isValid(id)){
    return console.log('Object id is not valid');
}

//find all documents that match condition
Todo.find({
    _id : id
}).then((todos)=>{
    console.log('Todos (find)',todos);
})

//find the first document that matches the condition
Todo.findOne({
    _id: id
}).then((todo) => {
    console.log('Todo (find one)',todo);
});

//find a document by using its id, null is returned if a result does not match
Todo.findById(id).then((todo)=>{
    if (!todo){
        return console.log('Id not found');
    }
    console.log('Todo (find by id)', todo)
}).catch((e)=>console.log(e));

