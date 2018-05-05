const { Todo } = require('../../models/todo');
const { ObjectID } = require('mongodb');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'l.stylianou@test1.com',
        password: 'userOnePass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
            }]
    },
    {
        _id: userTwoId,
        email: 'l.stylianou@test2.com',
        password: 'userTwoPass'
    }

]

const todos = [
    { text: 'Something to do 1' },
    { text: 'Something to do 2' },
    { text: 'Something to do 3' },
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