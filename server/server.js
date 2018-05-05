require('./config/config')

const _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((doc) => {
            res.status(201).send(doc);
        })
        .catch((err) => {
            res.status(400).send(err);
        })
});


app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos });
    }).catch((e) => res.status(400).send(e))
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ status: 'Error', message: "Not a valid document id" })
    }
    Todo.findById(req.params.id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send({ status: 'Warning', message: 'No match found' })
            }
            res.status(200).send({ status: 'OK', todo });
        }).catch((err) => {
            res.status(400).send();
        })
});


app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ status: 'Error', message: "Not a valid document id" })
    }
    Todo.findByIdAndRemove(req.params.id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send({ status: 'Warning', message: 'No document found to remove' })
            }
            res.status(200).send({ status: 'OK', todo });
        }).catch((err) => {
            res.status(400).send();
        });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    //pick the properties that are allowed to be updated
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({ todo });
        })
        .catch((err) => {
            res.status(400).send();
        })
})

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    //model method
    //User.findByToken

    //instance method
    //user.generateAuthToken

    user.save()
        .then(() => {
            // res.send(user);
            user.generateAuthToken()
                .then((token) => {
                    res.header('x-auth', token).send(user);
                }, (e) => {
                    res.status(400).send(e);
                })
        }, (e) => {
            res.status(400).send(e);
        })

        .catch((err) => {
            res.status(400).send(err);
        })
});



app.get('/users/me',authenticate,(req,res)=>{
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Started on port: ${port}`);
})



module.exports = { app };
