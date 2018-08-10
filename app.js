
//Libraries needed
//      Backend framework
const express = require('express');
//      Find path (for finding index.html)
var path = require('path');
//      Mongo driver
var mongo = require('mongodb').MongoClient;
//      Parsing json object
var bodyParser = require('body-parser');
//      Check for errors from mongo (not required but nice to have)
var assert = require('assert');

//Mongo information
var mongo_connection = 'mongodb://localhost:27017/';
var mongo_database = 'Trace';
var mongo_collection = 'Links';

//Start express app
const app = express();

//Add properties to the express app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')));

//HTTP Requests

// Add user to Mongo HTTP Post
app.post('/post-user', function(req,res) {
    
    //Lets connect to mongo first
    mongo.connect(mongo_connection, function(err, client) {
        assert.equal(null, err);

        //Get the collection to do work on
        var col = client.db(mongo_database).collection(mongo_collection);

        //save the name and link into local variables
        var name = req.body.name;
        var link = req.body.url;        

        //insert the variables into the mongo collection
        col.insertOne({name, link}, function(err, items) {            

            //confirm that it worked
            console.log("Inserted");
        });
    });

    // Redirect to the homepage when we are done
    res.redirect(303, '/')
});

// Update user's links to Mongo HTTP Post
app.post('/update-user', function(req,res) {
    
    //Lets connect to mongo first
    mongo.connect(mongo_connection, function(err, client) {
        assert.equal(null, err);

        //Get the collection to do work on
        var col = client.db(mongo_database).collection(mongo_collection);

        //save the name into local variable
        var name = req.body.name;

        //lets find the name first in mongo, if it exists, then we update the url
        col.findOne({name}, function(err, user) {
            assert.equal(null, err);

            //setup the update
            var newlink = { $set: {link: req.body.url } };

            //update the user from mongo (first parameter is the find, second parameter is the update)
            col.updateOne(user, newlink, function(err, items) {
                assert.equal(null, err);

                //confirm that it worked
                console.log("Url updated");
            });
        });
    });

    // Redirect to the homepage when we are done
    res.redirect(303, '/')
});

// Remove user from Mongo HTTP Post
app.post('/delete-user', function(req,res) {

    //Lets connect to mongo first
    mongo.connect(mongo_connection, function(err, client) {
        assert.equal(null, err);

        //Get the collection to do work on
        var col = client.db(mongo_database).collection(mongo_collection);

        //save the name into local variable
        var name = req.body.name;

        //lets find the name first in mongo, if it exists, then we delete
        col.find({name}).toArray(function(err, items) {
            console.log(err);

            //remove the user from mongo
            col.remove({'name': req.body.name}, function(err, items) {
                console.log(err);

                //confirm that it worked
                console.log("Name removed");
            });
        });
    });

    // Redirect to the homepage when we are done
    res.redirect(303, '/')
});


// Get all users from mongo.  This is tied to the Refresh button and when the HTML page loads
app.get('/get-user', function(req,res)  {
    
    //Lets connect to mongo first
    mongo.connect(mongo_connection, function(err, client) {
        assert.equal(null, err);

        //Get the collection to do work on
        var col = client.db(mongo_database).collection(mongo_collection);

        //get all users from the mongo databasse (empty {} means all users in mongo)
        col.find({}).toArray(function(err, items) {
            assert.equal(null, err);

            //return the users to the front end as json file
            res.json(items);
        });
    });
});

//Initial page, redirect (Pretty much a placeholder at the moment)
app.get('/', function(req, res) {
    res.send(200);
});

app.listen(3000);