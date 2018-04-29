// const MongoClient = require('mongodb').MongoClient;
//object distructuring
const {MongoClient,ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp',(err, db)=>{
    if (err) {
        console.log(`Unable to connect to MongoDB server`);
        return;
    }
    console.log('Connected to MongoDB server');


    //find one and update
    db.collection('Todos').findOneAndUpdate({
        "_id" : new ObjectID("5ae5fecba8a3a550e6fe4d12")},
        {
            $set: {
                completed: true
            }
        },
        {
            returnOriginal: true
        }
    ).then((result)=>{
        console.log(result);
    })

    db.close();
});