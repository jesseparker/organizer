//Parse data from JSON POST and insert into MYSQL

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

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

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+ '/index.html'));
});

app.post('/addThing', function(req, res) {

var jsondata = req.body;
var values = [];

for(var i=0; i< jsondata.length; i++)
  values.push([jsondata[i].id, jsondata[i].user_id, jsondata[i].name, jsondata[i].parentId, jsondata[i].type, jsondata[i].sku_min_qty, jsondata[i].sku_qty, jsondata[i].qty, jsondata[i].type_data, jsondata[i].rack_rows, jsondata[i].rack_cols, jsondata[i].rack_position, jsondata[i].imageData]);


//Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
connection.query('INSERT INTO things (thing_id, user_id, name, parentId, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData) VALUES ?', [values], function(err,result) {
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
  values = [jsondata[i].name, jsondata[i].parentId, jsondata[i].type, jsondata[i].sku_min_qty, jsondata[i].sku_qty, jsondata[i].qty, jsondata[i].type_data, jsondata[i].rack_rows, jsondata[i].rack_cols, jsondata[i].rack_position, jsondata[i].imageData, jsondata[i].id, jsondata[i].user_id];


//Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
connection.query('update things set name = ?, parentId = ?, type = ?, sku_min_qty = ?, sku_qty = ?, qty = ?, type_data = ?, rack_rows = ?, rack_cols = ?, rack_position = ?, imageData = ? where thing_id = ? and user_id = ?', values, function(err,result) {
  if(err) {
     res.send('Error');
          console.log(err);
  }
 else {
     res.send('Success');
  }
});
});

