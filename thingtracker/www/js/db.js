////// Database ops
function addThing(id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, callback) {
	
    db.transaction(function (tx) {

        var query = "INSERT INTO things (id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, time_created, time_modified, time_scanned) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		console.log(query);

		var now = new Date();
		var created = Math.round(now.getTime() / 1000);
        tx.executeSql(query, [id, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, created, created, created], function(tx, res) {
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
	
		var now = new Date();	
		var deleted = Math.round(now.getTime() / 1000);
		
        var query = "update things set time_deleted = ? where id = ?";
        //var query = "delete from things where id = ?";
		console.log(query);

        tx.executeSql(query, [deleted, id], function(tx, res) {
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

function purgeThing(id, callback) {

    db.transaction(function (tx) {
	
		var now = new Date();	
		var deleted = Math.round(now.getTime() / 1000);
		
        var query = "delete from things where id = ?";
        //var query = "delete from things where id = ?";
		console.log(query);

        tx.executeSql(query, [id], function(tx, res) {
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
			var query = "SELECT * from things where time_deleted is null and name like '%"+pattern+"%' order by time_modified desc limit "+limit;
		}
		else {		
			var query = "SELECT * from things where time_deleted is null order by time_modified desc limit "+limit;
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

function getAllThings(pattern = false, callback, limit = 1000) {

    db.transaction(function (tx) {


		if (pattern) {
			var query = "SELECT * from things where and name like '%"+pattern+"%' order by time_modified desc limit "+limit;
			var query = "SELECT * from things where and name like '%"+pattern+"%' order by time_modified desc limit "+limit;
		}
		else {		
			var query = "SELECT * from things order by time_modified desc limit "+limit;
			var query = "SELECT * from things order by time_modified desc limit "+limit;
		}

		var thing = null;
        tx.executeSql(query, [], function (tx, resultSet) {

		//console.log(resultSet);
			callback(resultSet);
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
///todo
function getDeletedThings(callback, limit = 1000) {

    db.transaction(function (tx) {

		var query = "SELECT * from things where time_deleted is not null";

		var thing = null;
        tx.executeSql(query, [], function (tx, resultSet) {

		//console.log(resultSet);
			callback(resultSet);
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

function getRackChildren(tid, callback) {
	
    db.transaction(function (tx) {

		var query = "SELECT * from things where parentId = ? order by rack_position";

		var thing = null;
		
        tx.executeSql(query, [tid], function (tx, resultSet) {

		//console.log(resultSet);
		
			callback(resultSet);
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
