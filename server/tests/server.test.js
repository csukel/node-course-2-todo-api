const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');

const { Todo } = require('../models/todo');
const { User } = require('../models/user');

const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(err);
                })
            })
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .send()
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toBe('Todo validation failed');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(0);
                    done();
                }).catch((err) => {
                    done(err);
                })
            })
    })

});

describe('GET /todos', () => {


    it('should return todos', (done) => {
        //before executing the GET request insert some dummy data into Todos collection
        Todo.insertMany(todos);
        request(app)
            .get('/todos')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({_creator:users[0]._id}).then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err))
            })
    })
});

describe('GET /todos/:id', () => {


    it('should return a todo', (done) => {
        //before executing the GET /todos/:id request insert a dcoument and get the id
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo._id).toBe(id.toHexString());
                })
                .end(done);
        }).catch((err) => done(err));
    })
    it('should not return a todo created by other user', (done) => {
        //before executing the GET /todos/:id request insert a dcoument and get the id
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .expect((res) => {
                    expect(res.body.status).toBe('Warning')
                    expect(res.body.message).toBe('No match found')
                })
                .end(done);
        }).catch((err) => done(err));
    })

    it('should return Not a valid document id', (done) => {
        var id = '3242';
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('Error');
                expect(res.body.message).toBe('Not a valid document id')
            })
            .end(done);
    })

    it('should return No match found', (done) => {
        var id = '6ae6ce510bcb09d83337a1ad'
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('Warning')
                expect(res.body.message).toBe('No match found')
            })
            .end(done)
    })
});


describe('DELETE /todos/:id', () => {
    it('should delete a todo using the id', (done) => {
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id

            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo._id).toBe(id.toHexString());
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.findById(id).then((todo) => {
                        expect(todo).toBeNull;
                        done();
                    })
                });
        }).catch((err) => done(err));
    });
    it('should not delete a todo using the id if the authenticated user is not the creator', (done) => {
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id

            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .end(done);
        }).catch((err) => done(err));
    });

    it('should output an error msg Not a valid document id', (done) => {
        var id = '45';

        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('Error')
                expect(res.body.message).toBe('Not a valid document id')
            })
            .end(done);
    });

    it('should not delete a document and output msg No document found to remove', (done) => {
        var id = '6ae806025a0aa0ac294803f7';
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('Warning')
                expect(res.body.message).toBe('No document found to remove')
            })
            .end(done)
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id,
                text = doc.text;

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .send({ text: 'Updated', completed: true })
                .expect((res) => {
                    expect(res.body.todo.text).toBe('Updated');
                    expect(res.body.todo.completed).toBeTruthy;
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.findById(id).then((todo) => {
                        expect(todo.text).toBe('Updated');
                        done();
                    })
                });
        }).catch((err) => done(err));
    })
    it('should not update the todo if the authenticated user is not the creator', (done) => {
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id,
                text = doc.text;

            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .send({ text: 'Updated', completed: true })
                // .expect((res) => {
                //     expect(res.body.todo.text).toBe('Updated');
                //     expect(res.body.todo.completed).toBeTruthy;
                // })
                .end(done);
        }).catch((err) => done(err));
    })

    it('should clear completedAt when todo is not completed', (done) => {
        Todo.create(todos[0]).then((doc) => {
            //console.log(doc);
            var id = doc._id,
                text = doc.text;
            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',users[0].tokens[0].token)
                .send({ text: 'Updated', completed: true })
                .expect((res) => {
                    expect(res.body.todo.completedAt).toBeDefined;
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    request(app)
                        .patch(`/todos/${id}`)
                        .set('x-auth',users[0].tokens[0].token)
                        .send({ text: "Updated without completed" })
                        .expect((res) => {
                            expect(res.body.todo.text).toBe('Updated without completed');
                            expect(res.body.todo.completedAt).toBeNull
                        })
                        .end(done);
                });
        }).catch((err) => done(err));
    })
})

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done)
    });

    it('should return a 401 if not authenticated and respones body should be empty', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toBeNull;
            })
            .end(done);
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        var user = {
            email: 'andrew@gmail.com',
            password: '123456'
        }
        request(app)
            .post('/users')
            .send(user)
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({ email: user.email });
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email: user.email })
                    .then((res) => {
                        expect(res).toExist();
                        expect(res.password).toNotBe(user.password);
                        expect(res.email).toBe(user.email);
                        done();
                    }, (e) => {
                        done(e);
                    })
            });
    });

    it('should return validation errors if email is invalid', (done) => {
        var user = {
            email: 'sdfjl',
            password: '123456'
        }
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body.name).toBe('ValidationError')
                expect(res.body.errors).toIncludeKey("email");
                expect(res.body.errors).toNotIncludeKey("password");
            })
            .end((err) => {
                if (err) {
                    done(err)
                }
                User.findOne({ email: user.email })
                    .then((res) => {
                        expect(res).toNotExist;
                        done();
                    })
            });
    })
    it('should return validation errors if password is invalid', (done) => {
        var user = {
            email: 'andrewa@gmail.com',
            password: '12345'
        }
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body.name).toBe('ValidationError')
                expect(res.body.errors).toIncludeKey("password");
                expect(res.body.errors).toNotIncludeKey("email");
            })
            .end((err) => {
                if (err) {
                    done(err)
                }
                User.findOne({ email: user.email })
                    .then((res) => {
                        expect(res).toNotExist;
                        done();
                    })
            });
    })
    it('should return validation errors if both email and password are invalid', (done) => {
        var user = {
            email: 'sdfs',
            password: '12345'
        }
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .expect((res) => {
                expect(res.body.name).toBe('ValidationError')
                expect(res.body.errors).toIncludeKey("password");
                expect(res.body.errors).toIncludeKey("email");
            })
            .end((err) => {
                if (err) {
                    done(err)
                }
                User.findOne({ email: user.email })
                    .then((res) => {
                        expect(res).toNotExist;
                        done();
                    })
            });
    })

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .expect((res) => {
                expect(res.body.code).toBe(11000);
                expect(res.body.errmsg).toInclude("duplicate key");
            })
            .end(done);
    });
})

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send(users[1])
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist;
                expect(res.body).toExist;
                expect(res.body.email).toBe(users[1].email);

            })
            .end((err, res) => {
                if (err) {
                    done(err)
                }

                User.findById(users[1]._id)
                    .then((user) => {
                        expect(user.tokens[user.tokens.length-1].token).toBe(res.headers['x-auth']);
                        done();
                    })
                    .catch((e)=>{
                        done(e);
                    })
            });
    })

    it('should reject invalid login', (done) => {
        users[0].password = 'invalid';
        request(app)
            .post('/users/login')
            .send(users[0])
            .expect(400)
            .expect((res)=>{
                expect(res.headers['x-auth']).toNotExist;
                expect(res.body).toBeNull
            })
            .end(done);
    })
})

describe('DELETE /users/me/token',()=>{
    it('should delete the auth token on logout',(done)=>{
        request(app)
            .delete('/users/me/token')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if (err){
                    done(err)
                }
                User.findById(users[0]._id).then((user)=>{
                    expect(user.tokens.length).toBe(0);
                    // expect(user.tokens[0]).toNotExist;
                    done();
                })
                .catch((e)=>{
                    done(e);
                });
            })
    });
})