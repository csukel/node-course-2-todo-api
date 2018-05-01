const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');

const {Todo} = require('../models/todo');

const todos = [
    {text:'Something to do 1'},
    {text:'Something to do 2'},
    {text:'Something to do 3'},
]

beforeEach((done)=>{
    Todo.remove({}).then(()=>{
        done();
    });
});

describe('POST /todos',()=>{
    it('should create a new todo',(done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(201)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err)=>{
                    done(err);
                })
            })
    });

    it('should not create todo with invalid body data',(done)=>{
        request(app)
        .post('/todos')
        .send()
        .expect(400)
        .expect((res)=>{
            expect(res.body.message).toBe('Todo validation failed');
        })
        .end((err,res)=>{
            if (err) {
                return done(err);
            }

            Todo.find().then((todos)=>{
                expect(todos.length).toBe(0);
                done();
            }).catch((err)=>{
                done(err);
            })
        })
    })

});

describe('GET /todos',()=>{


    it('should return todos',(done)=>{
        //before executing the GET request insert some dummy data into Todos collection
        Todo.insertMany(todos);
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(todos.length);
            })
            .end((err,res)=>{
                if (err){
                    return done(err);
                }
                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(todos.length);
                    done();
                }).catch((err)=>done(err))
            })
    })
});

describe('GET /todos/:id',()=>{


    it('should return a todo',(done)=>{
        //before executing the GET /todos/:id request insert a dcoument and get the id
        Todo.create(todos[0]).then((doc)=>{
            //console.log(doc);
            var id = doc._id

            request(app)
                .get(`/todos/${id}`)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo._id).toBe(id.toHexString());
                })
                .end(done);
        }).catch((err)=>done(err));
    })

    it('should return Not a valid document id',(done)=>{
        var id = '3242';
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect((res)=>{
                expect(res.body.status).toBe('Error');
                expect(res.body.message).toBe('Not a valid document id')
            })
            .end(done);
    })

    it('should return No match found',(done)=>{
        var id = '6ae6ce510bcb09d83337a1ad'
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect((res)=>{
                expect(res.body.status).toBe('Warning')
                expect(res.body.message).toBe('No match found')
            })
            .end(done)
    })
});


describe('DELETE /todos/:id',()=>{
    it('should delete a todo using the id',(done)=>{
        Todo.create(todos[0]).then((doc)=>{
            //console.log(doc);
            var id = doc._id

            request(app)
                .delete(`/todos/${id}`)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo._id).toBe(id.toHexString());
                })
                .end((err,res)=>{
                    if (err){
                        return done(err);
                    }
                    Todo.findById(id).then((todo)=>{
                        expect(todo).toBeNull;
                        done();
                    })
                });
        }).catch((err)=>done(err));
    });

    it('should output an error msg Not a valid document id',(done)=>{
        var id = '45';

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .expect((res)=>{
                expect(res.body.status).toBe('Error')
                expect(res.body.message).toBe('Not a valid document id')
            })
            .end(done);
    });

    it('should not delete a document and output msg No document found to remove',(done)=>{
        var id = '6ae806025a0aa0ac294803f7';
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .expect((res)=>{
                expect(res.body.status).toBe('Warning')
                expect(res.body.message).toBe('No document found to remove')
            })
            .end(done)
    });
});