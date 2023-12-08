const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const mongourl = 'mongodb://s1316117:s1316117@ac-ejy2hrk-shard-00-00.yt4veip.mongodb.net:27017,ac-ejy2hrk-shard-00-01.yt4veip.mongodb.net:27017,ac-ejy2hrk-shard-00-02.yt4veip.mongodb.net:27017/?ssl=true&replicaSet=atlas-pel08v-shard-0&authSource=admin&retryWrites=true&w=majority';
const dbName = '381project';

const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine','ejs');
const SECRETKEY = 'I want to pass the movie database system';

const  users = new Array(
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

app.post('/login', async(req,res) => {
    var i = 0;
    while(i<users.length){
        if(users[i].username === req.body.username && users[i].password === req.body.password){
            req.session.authenticated = true;        
            req.session.username = req.body.name;
        } i++;
    }res.redirect('/');
	
});

app.post('/logout', (req,res) => {

	req.session = null;
	res.status(200).send({ message: 'Logout successful' });  
	res.redirect('/login');
});

//home page
app.get('/home', (req,res) => {
		res.render('home',{})
});

app.post('/home', (req,res) => {
    if (!req.session.username) {
        return res.render('login');
      }
		res.render('home',{})
});

const createDoc = function(db, createddoc, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB Movie database server.");
        const db = client.db(dbName);
	    const moviescollection = db.collection('Movie');
        moviecollection.insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}

//CREATE
    
    app.get('/create',function(req,res,next){
        res.render('create');
    })
    app.post('/create',async function (req,res,next){
        const client = new MongoClient(mongourl);
        const db = client.db(dbName);
        try{
            if(req.body.length!=0){
                let result = await db.collection("Movie").insertOne(req.body);
                console.log(result);
                res.redirect('/home');
            }
        }catch(err){
            res.status(400).send('Please try again')
            
        }finally{await db.client.close()};
    });


    // READ
    app.get('/showAll', async(req, res) => {
        const client = new MongoClient(mongourl);
        const db = client.db(dbName);
        try{
            let result = await db.collection("Movie").find().toArray();
            res.render('showAll', {result});
        }catch(err){
            res.status(500).send ('Failed to fetch the movie details.' );
        }finally{await db.client.close()};
    });

    // - UPDATE
    
    app.get('/update/:id', (req,res)=>{
        const id = req.params.id;
        const client = new MongoClient(mongourl);
        const db = client.db(dbName);
        let result = db.collection("Movie").find({ _id : id.toString()})
        console.log(result);
        res.render('update',{result});
        db.client.close();
    })

    app.post('/update/:id',(req,res)=>{
        const id = req.params.id;
        const client = new MongoClient(mongourl);
        const db = client.db(dbName);
        let result = db.collection("Movie").updateOne(req.body);
        res.status(200).send("Update Successful!");
        db.client.close();
    })

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

/*  CREATE
curl -X POST -H "Content-Type: application/json" --data '{"film":"The Godfather","director":"Francis Ford Coppola","year":"1972"}' localhost:8099/api/movie/TheGodfather
curl -X POST -F 'bookingid=TheGodfather' localhost:8099/api/movie/TheGodfather
*/

    app.post('/api/movie/:film',(req,res) => {
        if (req.params.film){
            console.log(req.body)
            const client = new MongoClient(mongourl);
            client.connect((err) => {
                assert.equal(null,err);
                console.log("You have connected to the server");
                const db = client.db(dbName);
                let newDoc = {};
                newDoc['film'] = req.fields.film;
                newDoc['director'] = req.fields.director;
                newDoc['year'] = req.fields.year;
                newDoc['box'] = req.fields.box;
                if(req.files.filetoupload && req.files.filetoupload.size > 0){
                    fs.readFile(req.files.filetoupload.path, (err,data) => {
                        assert.equal(err,null);
                        db.collection('Movie').insertOne(newDoc,(err,results) => {
                            assert.equal(err,null);
                            client.close()
                            res.status(200).json({"Inserted successfully":newDoc}).end();
                        })
                    });
                }
            })
        } else {
        res.status(500).json({"error": "missing film"});
        }
    });

/* READ
curl -X GET http://localhost:8099/api/movie/HarryPotter
*/

app.get('/api/movie/:film', (req,res) => {
    if (req.params.film) {
        let standard ={};
        standard['film'] = req.params.film;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("You have connected to the server");
            const db = client.db(dbName);

            createDoc(db, standard, (doc) => {
                client.close();
                console.log("The DB connection have been closed");
                res.status(200).json(doc);
            })
        })
    } else {
        res.status(500).json({"error": "missing film"}).end();
    }
});

/*  UPDATE
curl -X PUT -H "Content-Type: application/json" --data '{"year":"1972"}' localhost:8099/api/movie/TheGodfather

curl -X PUT -F "year=2023" localhost:8099/api/movie/TheGodfather 
*/

app.put('/api/movie/film', (req,res) => {
    if(req.params.film) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null,err);
            console.log("You have connected to the server");
            const db = client.db(dbName);

            let standard = {}
            standard['film'] = req.params.film

            let docUpdate = {}
            Object.keys(req.fields).forEach((key) => {
                docUpdate[key] = req.fields[key];
            })
            console.log(docUpdate)
            if (req.files.filetoupload && req.files.filetoupload.size > 0) {
                fs.readFile(req.files.filetoupload.path, (err,data) => {
                    assert.equal(err,null);
                    db.collection('Movie').updateOne(criteria, {$set: updateDoc},(err,results) => {
                        assert.equal(err,null);
                        client.close()
                        res.status(200).json(results).end();
                    })
                })
            }
        })
    }
});

/*  DELETE
curl -X DELETE localhost:8099/api/movie/movie/TheGodfather 
*/

app.delete('api/movie/:film', (req,res) => {
    if(req.params.film) {
        let standard = {};
        standard['film'] = req.params.film;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("You have connected to the server");
            const db = client.db(dbName);
            db.collection('Movie').deleteMany(standard,(err,results) => {
                assert.equal(err,null)
                client.close()
                res.status(200).json(results).end();
            })
        });
    } else {
    res.status(500).json({"error": "missing film"}).end();
    }
});
app.listen(process.env.PORT || 8099);
