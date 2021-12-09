//Parse data from JSON POST and insert into MYSQL

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors');

// Configure MySQL connection
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'thing',
	password: 'porcupine',
	database: 'thing'
  })

//Establish MySQL connection
connection.connect(function(err) {
   if (err) 
      throw err
   else {
       console.log('Connected to MySQL');
       // Start the app when connection is ready
       app.listen(3334);
       console.log('Server listening on port 3334');
 }
});

app.use(bodyParser.json())

app.use(cors());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+ '/index.html'));
});

app.post('/addThing', function(req, res) {

var jsondata = req.body;
var values = [];

for(var i=0; i< jsondata.length; i++)
  values.push([jsondata[i].id, jsondata[i].user_id, jsondata[i].name, jsondata[i].parentId, jsondata[i].type, jsondata[i].sku_min_qty, jsondata[i].sku_qty, jsondata[i].qty, jsondata[i].type_data, jsondata[i].rack_rows, jsondata[i].rack_cols, jsondata[i].rack_position, jsondata[i].imageData, jsondata[i].time_created, jsondata[i].time_modified, jsondata[i].time_scanned]);


//Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
connection.query('INSERT INTO things (thing_id, user_id, name, parentId, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, time_created, time_modified, time_scanned) VALUES ?', [values], function(err,result) {
  if(err) {
     res.send('Error');
	  console.log(err);
  }
 else {
     res.send('Success');
  }
});
});

app.post('/updateThing', function(req, res) {

var jsondata = req.body;
var values = [];

for(var i=0; i< jsondata.length; i++)
  values = [jsondata[i].name, jsondata[i].parentId, jsondata[i].type, jsondata[i].sku_min_qty, jsondata[i].sku_qty, jsondata[i].qty, jsondata[i].type_data, jsondata[i].rack_rows, jsondata[i].rack_cols, jsondata[i].rack_position, jsondata[i].imageData, jsondata[i].time_created, jsondata[i].time_modified, jsondata[i].time_scanned, jsondata[i].id, jsondata[i].user_id];

console.log('update Thing');
connection.query('update things set name = ?, parentId = ?, type = ?, sku_min_qty = ?, sku_qty = ?, qty = ?, type_data = ?, rack_rows = ?, rack_cols = ?, rack_position = ?, imageData = ?, time_created = ?, time_modified = ?, time_scanned = ? where thing_id = ? and user_id = ?', values, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
     res.send('Success');
  }
});
});

app.post('/deleteThing', function(req, res) {

var jsondata = req.body;
var values = [];

  values = [jsondata[0].id, jsondata[0].user_id];

console.log('delete Thing', jsondata[0].id);
connection.query('delete from things where thing_id = ? and user_id = ?', values, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
     res.send('Success');
  }
});
});

app.post('/updateThingField', function(req, res) {

var jsondata = req.body;
var field = jsondata[0].field;

var substitutions = [jsondata[0].value, jsondata[0].id, jsondata[0].user_id];

console.log('update ' + field);

connection.query('update things set '+field+' = ? where thing_id = ? and user_id = ?', substitutions, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
     res.send('Success');
  }
});
});

app.post('/getThing', function(req, res) {

var jsondata = req.body;

var substitutions = [jsondata[0].id, jsondata[0].user_id];

console.log('get thing', substitutions);

connection.query('select * from things where thing_id = ? and user_id = ?', substitutions, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
     res.send(JSON.stringify(result[0]));
  }
});
});

app.post('/getThings', function(req, res) {

	res.set('Access-Control-Allow-Origin', '*');

var jsondata = req.body;

var substitutions = [jsondata[0].user_id];

console.log('get things', substitutions);

connection.query('select * from things where user_id = ?', substitutions, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
	 res.set('Access-Control-Allow-Origin', '*');

     res.send(JSON.stringify(result));
  }
});
});

app.post('/register', function(req, res) {

        res.set('Access-Control-Allow-Origin', '*');

var jsondata = req.body;

var substitutions = [jsondata[0].email, jsondata[0].password];

console.log('register', substitutions);


connection.query('insert into users (email, password) values (?, ?)', substitutions, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
        // res.set('Access-Control-Allow-Origin', '*');
	var userId = result.insertId;
	 var out = {userId:userId};
	
     res.send(JSON.stringify(out));
  }
});
});

app.post('/login', function(req, res) {

//        res.set('Access-Control-Allow-Origin', '*');

var jsondata = req.body;

var substitutions = [jsondata[0].email, jsondata[0].password];

console.log('login', substitutions);


connection.query('select id from users where email = ? and password = ?', substitutions, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
	 console.log(result);
        var userId = result[0].id;
         var out = {userId:userId};
console.log(out);
     res.send(JSON.stringify(out));
  }
});
});





