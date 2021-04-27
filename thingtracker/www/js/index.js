/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var db = null;
var dbFile = 'tnings.db';
var dbdirectory = null;
var toplevel = null;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		
		//document.addEventListener("backbutton", onBackKeyDown, false);

		document.addEventListener('backbutton', onBackButton, false);

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {

		dbdirectory = cordova.file.applicationStorageDirectory + "databases/";

		// DB backup
		if (false) {
			var outfilename = 'backup-after.db';

			// copy DB file out to non-private app directory.

			window.resolveLocalFileSystemURL(dbdirectory + dbFile, function (fileEntry) {
				window.resolveLocalFileSystemURL((cordova.file.externalDataDirectory || cordova.file.documentsDirectory), function(dirEntry) {
					fileEntry.copyTo(dirEntry, outfilename, function() { console.log("copyDBFileOut() succeeded");}, this.errorHandler);
				});
			  });
		
		}
	
		db = window.sqlitePlugin.openDatabase({name: dbFile, location: 'default'});
		//db = window.sqlitePlugin.openDatabase({name: dbFile, location: cordova.file.externalDataDirectory, iosDatabaseLocation: 'Library'});

		db.transaction(function (tx) {

		
			//tx.executeSql('drop TABLE things');
			//tx.executeSql('ALTER TABLE things ADD type_data text');
			//tx.executeSql('ALTER TABLE things ADD rack_rows');
			//tx.executeSql('ALTER TABLE things ADD rack_cols');
			//tx.executeSql('ALTER TABLE things ADD rack_position');
			//tx.executeSql('ALTER TABLE things ADD time_created integer');
			//tx.executeSql('ALTER TABLE things ADD time_modified integer');
			//tx.executeSql('ALTER TABLE things ADD time_scanned integer');
			//tx.executeSql('ALTER TABLE things ADD time_scanned integer');
			//tx.executeSql('ALTER TABLE things ADD imageData text');
			//tx.executeSql('CREATE TABLE IF NOT EXISTS things (id text, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, time_created integer, time_modified integer, time_scanned integer)');
		
			//tx.executeSql('update things set time_modified = time_modified / 1000');
			tx.executeSql('CREATE TABLE IF NOT EXISTS things (id text, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, time_created integer, time_modified integer, time_scanned integer)');
 
		}, function (error) {
			console.log('transaction error: ' + error.message);
		}, function () {
			console.log('transaction ok');
		});
		/*
		getNextUntaggedId(function(unid) {

		db.transaction(function (tx) {
			var sql = "update things set id = '"+unid+"' where name like 'Wemos h-bridge shield%'";
			console.log(sql);
			tx.executeSql(sql);

		}, function (error) {
			console.log('transaction error: ' + error.message);
		}, function () {
			console.log('transaction ok');
		});
		});
		*/
		begin(); 
		
		
		$('#things').click(function () {
			getThings();
		});
    },

    // Update DOM on a Received Event

};

app.initialize();

/*function onBackKeyDown() {
    console.log('back');
//	return true;
e.preventDefault();

}
*/

function onBackButton(){
	  if(toplevel == "#list"){
	navigator.app.exitApp();
}
else{
	console.log("go to list");
	listThings();

}

}

// From camera plugin example
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
		targetHeight: 200,
        targetWidth: 200,
        //destinationType: Camera.DestinationType.FILE_URI,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: $("input[name='editPictures']:checked").val(),
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}
function openCamera(selection, dest, tid) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
		$(dest).attr('src', "data:image/jpeg;base64," + imageUri);  // Put image in destination
  $('.savebtn').show();
  $('#current').show();
        //displayImage(imageUri);
        // You may choose to copy the picture, save it somewhere, or upload.
        //func(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
}
function createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

    }, onErrorResolveUrl);
}

////// Database ops
function addThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback) {
	
    db.transaction(function (tx) {

        var query = "INSERT INTO things (id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, time_created, time_modified, time_scanned) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		console.log(query);

		var now = new Date();
		var created = Math.round(now.getTime() / 1000);
        tx.executeSql(query, [id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, created, created, 0], function(tx, res) {
            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
			callback(id, res.rowsAffected);
        },
        function(tx, error) {
            console.log('INSERT error: ' + error.message);
        });
    }, function(error) {
        console.log('transaction error: ' + error.message);
    }, function() {
        console.log('transaction ok');
    });
}

function updateThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback) {
    db.transaction(function (tx) {

        var query = "update things set name = ?, imageFile = ?, parentId = ?, print = ?, type = ?, sku_min_qty = ?, sku_qty = ?, qty = ?, type_data = ?, rack_rows = ?, rack_cols = ?, rack_position = ?, imageData = ?, time_modified = ? where id = ?";
		console.log(query);
		
		var now = new Date();
		var updated = Math.round(now.getTime() / 1000);
        tx.executeSql(query, [name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, updated, id], function(tx, res) {
            //console.log("insertId: " + res.insertId + " -- probably 1");
            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
			callback(id, res.rowsAffected);
        },
        function(tx, error) {
            console.log('UPDATE error: ' + error.message);
        });
    }, function(error) {
        console.log('transaction error: ' + error.message);
    }, function() {
        console.log('transaction ok');
    });
}

function deleteThing(id, callback) {

    db.transaction(function (tx) {

        var query = "delete from things where id = '" +tid+"'";

        tx.executeSql(query, [], function(tx, res) {
            //console.log("insertId: " + res.insertId + " -- probably 1");
            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
			callback(res.rowsAffected);
        },
        function(tx, error) {
            console.log('UPDATE error: ' + error.message);
        });
    }, function(error) {
        console.log('transaction error: ' + error.message);
    }, function() {
        console.log('transaction ok');
    });
}

function orphanThing(tid, callback) {

    db.transaction(function (tx) {

        var query = "update things set parentId = 0 where id = '" +tid+"'";

        tx.executeSql(query, [], function(tx, res) {
            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
			callback(res.rowsAffected);
        },
        function(tx, error) {
            console.log('UPDATE error: ' + error.message);
        });
    }, function(error) {
        console.log('transaction error: ' + error.message);
    }, function() {
        console.log('transaction ok');
    });
}

function saveThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback) {

	if(id == null || id == undefined || id == '' ) {
		getNextUntaggedId(function(id) {
			addThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback);			
		});
		return true;
	}
	
	console.log('saveThing ' + id);
	updateThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, function(insertId, rowsAffected) {
		if (rowsAffected < 1) {
			addThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback);
		}
		else {
			callback();
		}
	});
}

function updateThingField(id, field, value, callback) {
	console.log('updateThingField ' + id);
    db.transaction(function (tx) {

        var query = "update things set "+field+" = ? where id = ?";
		console.log(query);
		
		//var now = Date.now();
        tx.executeSql(query, [value, id], function(tx, res) {
            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
			callback(id, res.rowsAffected);
        },
        function(tx, error) {
            console.log('UPDATE error: ' + error.message);
        });
		
    }, function(error) {
        console.log('transaction error: ' + error.message);
    }, function() {
        console.log('transaction ok');
    });
}
function getThings(pattern = false, callback, limit = 20) {

    db.transaction(function (tx) {

		if (pattern) {
			var query = "SELECT * from things where name like '%"+pattern+"%' order by time_modified desc limit "+limit;
		}
		else {		
			var query = "SELECT * from things order by time_modified desc limit "+limit;
		}
		var thing = null;
        tx.executeSql(query, [], function (tx, resultSet) {

		//console.log(resultSet);
		
			$('#listul').html('');
            for(var x = 0; x < resultSet.rows.length; x++) {
				thing = resultSet.rows.item(x);
			
                //console.log(thing);
				callback(thing);
				
			}
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });
}

function getThing(tid, foundCallback, notFoundCallback) {
console.log('getThing ' +tid);

    db.transaction(function (tx) {

        var query = "SELECT * from things where id = '" + tid +"'";
		console.log(query);

//		var out = [];
        tx.executeSql(query, [], function (tx, resultSet) {

			console.log(resultSet);
			
			if (resultSet.rows.length < 1) {
				notFoundCallback();
				return false;
			}
			
			var thingg = resultSet.rows.item(0);
			foundCallback(thingg);
		
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });
}

function getLineage(tid, callback, lineage = '', rackPosition = '') {
	
	getThing(tid, function(thingy) {

		if ( thingy.type == 'RACK' && rackPosition != '') {
			lineage = ' [' + rackPosition + ']' + lineage;
		}

		lineage = thingy.name + lineage;
		
		if ( thingy.parentId == undefined || thingy.parentId == '' || thingy.parentId == 0) {
			callback(lineage);
			return true;
		}

		rp = thingy.rack_position;
		
		lineage = ' > ' + lineage;
		getLineage(thingy.parentId, callback, lineage, thingy.rack_position);
		return false;
	},
	function () {
		
	});
}

function getChildren(tid, callback) {
	
    db.transaction(function (tx) {

		var query = "SELECT * from things where parentId = '"+tid+"'";

		var thing = null;
		
        tx.executeSql(query, [], function (tx, resultSet) {

		//console.log(resultSet);
		
            for(var x = 0; x < resultSet.rows.length; x++) {
				thing = resultSet.rows.item(x);
				
                console.log('child ' + thing);
				
				callback(thing);
				
			}
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });

}

function setSkuQty(tid, qty) {
	
    db.transaction(function (tx) {

		var query = "update things set sku_qty = "+qty+" where id = '"+tid+"'";
		console.log(query);
		
        tx.executeSql(query, [], function (tx, resultSet) {

			//console.log(resultSet);

        },
        function (tx, error) {
            console.log('setSkuQty error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });

}

function getNextUntaggedId(callback, prefix = 'TTU') {
	
    db.transaction(function (tx) {

		var query = "select count(id) macks from things where id like '"+prefix+"%'";
		console.log(query);
		
        tx.executeSql(query, [], function (tx, resultSet) {

			if (resultSet.rows.length > 0) {
				var max = resultSet.rows.item(0).macks;
				console.log('max '+max);
				if (max == null) {
					callback(prefix + "1");
					return true;
				}
				console.log(resultSet.rows.item(0));
				console.log(max);
				var number = parseInt(max);
				number++;
				callback(prefix + number);
				return true;
			}
			else {
				callback(prefix + "1");
				return true;
			}
        },
        function (tx, error) {
            console.log('getNextUntaggedId error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });

}

function getRecent(callback) {
	
    db.transaction(function (tx) {

		var query = "SELECT * from things where time_scanned > 0 order by time_scanned desc limit 10";

		var thing = null;
		
        tx.executeSql(query, [], function (tx, resultSet) {

		//console.log(resultSet);
		
            for(var x = 0; x < resultSet.rows.length; x++) {
				thing = resultSet.rows.item(x);
				
                console.log('recent ' + thing);
				
				callback(thing);
				
			}
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });

}




function tidExists(tid, existsCallback, doesNotExistCallback) {
	
    db.transaction(function (tx) {

		var query = "select count(*) exis from things where id = '"+tid+"'";
		
        tx.executeSql(query, [], function (tx, resultSet) {

			var exists = parseInt(resultSet.rows.item(0).exis);
			console.log('exists '+exists);
			if (exists == 0) {
				doesNotExistCallback();
				return false;
			}
			existsCallback();
			return true;

        },
        function (tx, error) {
            console.log('tidExists error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });

}

function updateTid(current, to_be, successCallback, errorCallback) {
	
	tidExists(to_be, function() {
		console.log('tid in use');
		errorCallback();
		return false;
	},
	function() {
		console.log('tid not in use');

		db.transaction(function (tx) {

			var query = "update things set id = '"+to_be+"' where id = '"+current+"'";
			console.log(query);
			
			tx.executeSql(query, [], function (tx, resultSet) {

				//console.log(resultSet);
				if (resultSet.rowsAffected == 1) {
					successCallback();
					return true;
				}
				errorCallback();
				return false;
			},
			function (tx, error) {
				console.log('setSkuQty error: ' + error.message);
			});
		}, function (error) {
			console.log('transaction error: ' + error.message);
		}, function () {
			console.log('transaction ok');
		});		
	});


}

function addOnServer(thing) {
		sendJSON('addThing', thing);
}

function updateOnServer(thing) {
		sendJSON('updateThing', thing);
}

function updateFieldOnServer(thing, field) {
	var value = thing[field];
		sendJSON('updateThingField', { 'id': thing.id, 'field': field, 'value': thing[field], 'user_id': thing.user_id });
}

function sendJSON(method, data){

	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   console.log(this.responseText);
		}
	 };
	xmlhttp.open("POST", "http://tango.ca:3334/"+method);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify([data]));

}

