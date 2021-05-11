
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

function getThingFromServer(thing, callback) {

		return sendJSON('getThing', { 'id': thing.id, 'user_id': thing.user_id }, callback, thing);
}

function getThingsFromServer(callback) {

		return sendJSON('getThings', { 'user_id': userId }, callback);
}

function sendJSON(method, data, callback = false, thing = false){

	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
			if (callback != false)
				callback(thing, xmlhttp.response);
		}
	 };
	xmlhttp.open("POST", "http://tango.ca:3334/"+method);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify([data]));

	
}
