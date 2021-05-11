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
			//tx.executeSql('ALTER TABLE things ADD time_deleted integer');
		
			//tx.executeSql('update things set time_modified = time_modified / 1000');
			tx.executeSql('CREATE TABLE IF NOT EXISTS things (id text, name, imageFile, parentId, print, type, sku_min_qty, sku_qty, qty, type_data, rack_rows, rack_cols, rack_position, imageData, time_created integer, time_modified integer, time_scanned integer, time_deleted)');
 
		}, function (error) {
			console.log('transaction error: ' + error.message);
		}, function () {
			console.log('transaction ok');
		});

		begin(); 
		
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
/* function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
} */
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


