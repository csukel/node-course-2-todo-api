const { Todo } = require('../../models/todo');
const { ObjectID } = require('mongodb');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const JWT_SECRET = process.env.JWT_SECRET;

const users = [
    {
        _id: userOneId,
        email: 'l.stylianou@test1.com',
        password: 'userOnePass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneId, access: 'auth' }, JWT_SECRET).toString()
            }]
    },
    {
        _id: userTwoId,
        email: 'l.stylianou@test2.com',
        password: 'userTwoPass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userTwoId, access: 'auth' }, JWT_SECRET).toString()
            }]
    }

]

const todos = [
    { _id: new ObjectID , text: 'Something to do 1', _creator:userOneId },
    { _id: new ObjectID, text: 'Something to do 2', _creator: userOneId },
    { _id: new ObjectID, text: 'Something to do 3' , _creator: userTwoId },
]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        done();
    });
};

const populateUsers = (done) => {
    User.remove({}).then(()=>{
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne,userTwo])
    }).then(()=> done());
}

module.exports = {
    populateTodos,
    todos,
    users,
    populateUsers
}