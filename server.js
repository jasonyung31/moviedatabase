//const MongoClient = require('mongodb').MongoClient;
//const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb://s1316117:s1316117@ac-ejy2hrk-shard-00-00.yt4veip.mongodb.net:27017,ac-ejy2hrk-shard-00-01.yt4veip.mongodb.net:27017,ac-ejy2hrk-shard-00-02.yt4veip.mongodb.net:27017/?ssl=true&replicaSet=atlas-pel08v-shard-0&authSource=admin&retryWrites=true&w=majority';
const dbname = '381projects';
const assert = required('assert');
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine','ejs');
const SECRETKEY = 'I want to pass the movie database system';

const users = new Array(
        {username: 'test1', password: 'password1'},
        {username: 'test2', password: 'password2'},
        {username: 'test3', password: 'password3'}
);

app.use(session({
    name: 'sessionLogin',
    keys:[SECRETKEY]
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    
		res.redirect('/login');
	} else {
		res.status(200).render('secrets',{name:req.session.username});
	}
});

//login
app.get('/login', (req,res) => {
	res.status(200).render('login',{});
});

app.post('/login', (req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {
            req.session.authenticated = true;        
			req.session.username = req.body.name;	
		}
	});
	res.redirect('/');
});

app.post('/logout', (req,res) => {
	req.session = null; 
	res.status(200).json({ message: 'Logout successful' });  
	res.redirect('/login');
});

const createDoc = function(db, createddoc, callback){
    const client = new mongoclient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB Movie database server.");
        const db = client.db(dbName);
        db.collection('movies').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}

//CREATE
    app.post('/create', (req, res) => {
  		const { title, genre, year } = req.body;
  		const new_Movie = new Movie({ title, genre, year });

  	new_Movie.save((err) => {
    	if (err) {
      		console.error('Error creating movie:', err);
      		res.status(500).send('An error occurred');
    	} 
	else {
    	  	res.send('A new movie is created successfully');
    	}
  });
});

    // READ
    app.get('/film', (req, res) => {
        Movie.find({}, (err, movies) => {
            if (err) {
                res.status(500).send('Error fetching the films.');
                return;
            }
            if (result) {
                res.status(200).send(result);
            }
        });
    });

    // - UPDATE
    app.put('/update/:id', (req, res) => {
        const id = req.params.id;
        const updatedRestaurant = req.body;
        db.collection('film').updateOne({ filmID: ObjectID(id) }, { $set: updatedRestaurant }, (err, result) => {
            if (err) {
                res.status(500).send('Error updating film.');
                return;
            }
            res.status(200).send(result);
        });
    });

    // DELETE
    app.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
        db.collection('film').deleteOne({ filmID: ObjectID(id) }, (err, result) => {
            if (err) {
                res.status(500).send('Error deleting restaurant.');
                return;
            }
            res.status(200).send(result);
        });
    });
app.listen(process.env.PORT || 8099);
