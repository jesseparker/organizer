// ThingTracker copyright 2015 Jesse Parker


var TID_THING = 1;
var TID_INVALID = -1;
//var qrsc = "";
var userId = 2029;

function ajaxError(z, a, b, c) {
	//alert('ajaxError: ' + z + ':' + JSON.stringify(a) + ' ' + b + ' ' + c);
	if (a.status == 403 ) {
		$(".loggedin").hide();
		switch_toplevel("#login");

		status_msg('Please log in');
	}
	
}

function chooseRecent(tag) {
	$('#manualtag').val(tag);
	completeScanQr($('#manualtag').val(), $('#manualform').attr('data-mode'));
	return false;
}

function begin() {

	listThings();
	updateRecent();
	
	$('.scanqrbtn').click( function () {
		
	$("#manual").val("TT");
	$(".savebtn").hide();
	
	//qrsc = $("input[name='qrscanner']:checked").val();

	//alert(qrsc);
	//tid = $($(this).attr('data-tid')).html();
	dest = $(this).attr('data-dest');
	mode = $(this).attr('data-mode');
	
	if (! mode) mode = 'lookup';
	 
	$('#manualform').attr('data-dest', dest);
	$('#manualform').attr('data-mode', mode);
	
	//alert(mode + ' ' + dest);
		
	switch_toplevel('#scanqr');

	cordova.plugins.barcodeScanner.scan(
		function (result) {

			//alert("We got a barcode\n" +
			//	"Result: " + result.text + "\n" +
			//	"Format: " + result.format + "\n" +
			//	"Cancelled: " + result.cancelled);
			
			if(result.cancelled == true) return false;
			
			console.log(result);
			completeScanQr(result.text, mode);
			return true;
			
	  },
	  function (error) {
		  alert("Scanning failed: " + error);
	  },
	  {
		  preferFrontCamera : false, // iOS and Android
		  showFlipCameraButton : true, // iOS and Android
		  showTorchButton : true, // iOS and Android
		  torchOn: ($("input[name='scanLight']:checked").val() == 'true') ? true : false, // Android, launch with the torch switched on (if available)
		  saveHistory: true, // Android, save scan history (default false)
		  prompt : "Place a barcode inside the scan area", // Android
		  resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
		  //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
		  formats : "QR_CODE",
		  orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
		  disableAnimations : true, // iOS
		  disableSuccessBeep: ($("input[name='scanBeep']:checked").val() == 'false') ? true : false // iOS and Android
	  }
   );

}); // end scanqrbtn


$('.settingsbtn').click(function() {
	switch_toplevel('#settings');
});

//////// Camera ////////

$('.camerabtn').click(function() {
	$('#camera .snapbtn').attr('data-dest', $(this).attr('data-dest'));
	$('#camera .snapbtn').attr('data-tid', $(this).attr('data-tid'));

	openCamera('normal', $(this).attr('data-dest'), $(this).attr('data-tid'));
});




$("#deletething").click(function() {

	tid = $('#thing').html();

	deleteThing(tid, function() {
		listThings();
	});

	status_msg('Deleted<span class="glyphicon glyphicon-remove"></span>');
	return true;

});

////// Save ///////

$('.savebtn').click(function() {
console.log('savebtn '+ $('#thing').html());

	tid = $('#thing').html();
	parent = $('#parent').html();

	saveThing($('#thing').html(), $('#thingname').val(), $('#thingimg').attr('src'),  $('#parent').html(), $("#printq").prop('checked'),$("#thingtype").val(),$("#skuminqty").val(),$("#skuqty").val(),$("#qty").val(), "", $("#rackrows").val(), $("#rackcols").val(), $("#rackposition").val(), $('#thingimg').attr('src'), function(saveId, saveAffected) {

		$('#thing').html(saveId); // In case new, set id
		$('.savebtn').hide();
		
		status_msg('Saved<span class="glyphicon glyphicon-saved"></span>');
		return true;
	
	});	
	


});


$('.removebtn').click(function() {
	tid = $('#thing').html();

	orphanThing(tid, function() {
		resetParent();
		$('.parentcur').hide();		
	});

	
});

$('.newthing').click(function() {

	switch_toplevel('#current');

	resetThing();
	resetParent();
	$('.parentcur').hide();
	
	return true;


});



$('.mythings').click(function() {
	return listThings();
});

$('#inventory').click(function() {

	switch_toplevel('#list');

	$.ajax({
		dataType: "html",
		type: "ajax",
		url: '/api/things/inventory',
		success: function (data, textStatus){
			$("#list").html(data);
		},
		error: function (jqXHR, textStatus, errorThrown) { ajaxError('origin', jqXHR, textStatus, errorThrown); }
	});

	return true;
});


$('.thingsearch').on('submit', function() {

	$("#listul").html('');
	switch_toplevel('#list');

	updateThingList($('.thingsearch input').val());	
	return false;
//	return listThings($('.thingsearch input').val());

});

$('#parentimg').click(function() {
	thingDetail($('#parent').html());
});
$('#pimg').click(function() {
	thingDetail($('#parent').html());
});
$('#markprintedbtn').click(function() {
	$.ajax({
		dataType: "html",
		type: "GET",
		url: '/api/displays/markprinted',
		success: function (data, textStatus){
			status_msg('Printed');
		
		},
		error: function (jqXHR, textStatus, errorThrown) { ajaxError('origin', jqXHR, textStatus, errorThrown); }

	});
	return true;
});

$('#printq').change(function() {
		
	$.ajax({
		type: "POST",
		url: '/api/displays/marktoprint',
		data: {tid:$('#thing').html(), print: $('#printq').prop('checked')},
		success: function (data, textStatus){
			//alert(data);
			status_msg('Saved');
		
		},
		error: function (jqXHR, textStatus, errorThrown) { ajaxError('origin', jqXHR, textStatus, errorThrown); }

	});
	return true;
});



$('#loginbtn').click(function() {
		console.log("login");
		$.ajax({
		//dataType: "html",
		type: "POST",
		url: "/api/users/login/",
		data: {'User': { 'username': $('#username').val(), 'password': $('#password').val() }},
		success: function (data, textStatus){
			console.log(data);
			if (data == 0 ) {
				switch_toplevel('#home');
				$('.loggedin').show();
			}
			else if (data == 1) {
				console.log("invalid credentials");
		                status_msg('Invalid Credentials');
			}
			
		},
		error: function (jqXHR, textStatus, errorThrown) { ajaxError('origin', jqXHR, textStatus, errorThrown); }
		
	});
	
	return false;
	
	});
	
$('#logoutbtn').click(function() { 
		$.ajax({
		dataType: "html",
		type: "GET",
		url: '/api/users/logout',
		success: function (data, textStatus){
			status_msg("Goodbye");
			switch_toplevel('#home');
		},
		error: function (jqXHR, textStatus, errorThrown) { ajaxError('origin', jqXHR, textStatus, errorThrown); }

	});
	
	return true;
	
	});


$('#manualform').on('submit', function() {

	completeScanQr($('#manualtag').val(), $('#manualform').attr('data-mode'));


	return false;

});


	

// Dirtiers 
$('.curdirty').keyup(function() { $('.savebtn').show() });
$('#thingtype').change(function() {
	$('.savebtn').show();
	if ( $(this).val() == 'SKU') $('.sku').show();
	else $('.sku').hide(); 
	if ( $(this).val() == 'RACK') $('.rack').show();
	else $('.rack').hide();
});
// Close collapsed menu on click
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});
$(document).on('click','.dropdown-menu',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});
$('.thingsearch').on('submit', function() {$('.navbar-collapse.in').collapse('hide'); } );



$('.collapse').on('shown.bs.collapse', function(){
$(this).parent().find(".glyphicon-menu-down").removeClass("glyphicon-menu-down").addClass("glyphicon-menu-up");
}).on('hidden.bs.collapse', function(){
$(this).parent().find(".glyphicon-menu-up").removeClass("glyphicon-menu-up").addClass("glyphicon-menu-down");
});


$('.qtyadjup').click(function (){
	tid=$('#thing').html();
	q = $('#qty').html();
	q++;
	$('#qty').html(q);
	$('#skuqty').val(q);
	
	setSkuQty(tid, q);
	
	return true;
});

$('.qtyadjdown').click(function (){
	tid=$('#thing').html();
	q = $('#qty').html();
	q--;
	$('#qty').html(q);
	$('#skuqty').val(q);
	
	setSkuQty(tid, q);
	
	return true;
});

$('#skuqty').change(function() {
	$('#qty').html($('#skuqty').val());
});

$('.savebtn').hide();

$('.uploadAll').click(function() {
	updateAll();
});

} // end begin


function listThings(){

	$("#listul").html('');

	switch_toplevel('#list');
	
	updateThingList();

}

function updateThingList(pattern = false) {
	getThings(pattern, function(thing) {
// getLineage like this has some kind of scope conflict for thing
//getLineage(thing.id, function(lineage) {

	var qty = '';
	if (thing.type == 'SKU') qty = '<p>Stock: '+thing.sku_qty+'</p>';
	
	var thingImage = getImageSrc(thing);
	
	$('#listul').append(`<li class="list-group-item"  onclick="thingDetail('${thing.id}'); return false;">
<div class="listing row" class="tagselector">
	<div class="col-xs-6">
		<img src="${thingImage}" class="img-responsive img-rounded">
	</div>
	<div class="col-xs-6">
		<p>${thing.name}</p>
		${ qty }
	</div>
</div>
</li>`);
//});		
	});
	
}
/*

function getFileContentAsBase64(path,callback){
    window.resolveLocalFileSystemURL(path, gotFile, fail);
            
    function fail(e) {
          console.log("No file found for "+path);
    }

    function gotFile(fileEntry) {
           fileEntry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                   var content = this.result;
                   callback(content);
              };
              // The most important point, use the readAsDatURL Method from the file plugin
              reader.readAsDataURL(file);
           });
    }
}

function convertImages() {
	getThings(false, function(thing) {
		getFileContentAsBase64(thing.imageFile, function(b64) {
			console.log("converted "+thing.imageFile+" to: ");
			console.log(b64);
			console.log(b64.length);
			updateThingField(thing.id, 'imageData', b64, function() {
				console.log('Updated imageData');
			});
			
		});
	});
}
*/

function thingDetail(tid) {
	console.log('thingDetail ' + tid);
	  switch_toplevel('#current');
	  return lookupThing(tid);
}
function resetThing() {
	$("#collapseOne").collapse('hide');
	$(".savebtn").hide();
	$("#thingimg").attr('src', 'img/none.png');
	$("#thing").html('');
	$("#tname").html('');
	$("#thingname").val('');
	$("#thingtype").val('UNQ');
	$("#skuminqty").val(0);
	$("#skuqty").val(1);
	$("#printq").prop('checked', false);
	$(".sku").hide();
	$(".rack").hide();
	$("#parent").html('');
	$("#lineage").html('');
	$("#rackcols").val('');
	$("#rackrows").val('');
	$("#rackposition").val('');
	$("#rackposition").hide();
	$("#settag").hide();
	
	$(".tMain").removeClass('col-xs-8');
	$(".tMain").addClass('col-xs-12');
	$(".tInfo").hide();
	$(".removebtn").hide();


	return true;
}
function resetParent() {
	$("#parentimg").attr('src', 'img/none.png');
	$("#pimg").attr('src', 'img/none.png');
	$("#parent").html('');
	$("#parentname").html('');
	$("#pname").html('');
	$("#children").html('');
	$("#parentind").hide();
	$(".rackposition").hide();

	$(".tMain").removeClass('col-xs-8');
	$(".tMain").addClass('col-xs-12');
	$(".tInfo").hide();
	$(".removebtn").hide();


	return true;
}

function getImageSrc(thing) {
	if((thing.imageFile === null || thing.imageFile === '') && (thing.imageData === null || thing.imageData === '')) {
		console.log('no image for this thing');
		//$("#thingimg").attr('src', 'img/none.png');
		//callback('img/none.png');
		return 'img/none.png';
	}
	else if(thing.imageData != null ) {
		console.log('image found: DATA_URL');
		//$("#thingimg").attr('src', thing.imageData);
		//callback(thing.imageData);
		return thing.imageData;
	}
	else {
		console.log('image found: FILE_URI');
		// abandoned
		//$("#thingimg").attr('src', thing.imageFile);
		//callback(thing.imageFile);
		//return thing.imageFile;
		return 'img/none.png';
	}
}

function getShortName(thing) {
	return (thing.name.length > 12) ? thing.name.substr(0, 12) + '...' : thing.name;
}
				
function lookupThing(tid) {
	console.log('lookupThing '+tid);
	$(".parentcur").hide();
	resetThing();
	resetParent();
	getThing(tid, function(thing) {
			console.log(thing.id +
				", img: " + thing.imageFile);
			
		
		$("#thing").html(thing.id);
		$("#tname").html(thing.name);
		$("#thingname").val(thing.name);
		$("#thingtype").val(thing.type);
		$("#skuminqty").val(thing.sku_min_qty);
		$("#skuqty").val(thing.sku_qty);
		$("#rackcols").val(thing.rack_cols);
		$("#rackrows").val(thing.rack_rows);
		$("#rackposition").val(thing.rack_position);
		$("#qty").html(thing.sku_qty);
		$("#printq").prop('checked', thing.print);

		getLineage(thing.id, function(lineage) {
			$("#lineage").html(lineage);
		});
		if (thing.id.substr(0,3) == 'TTU') {
			$('#settag').show();
		}
		if ( $('#thingtype').val() == 'SKU') $('.sku').show(); else $('.sku').hide();
		if ( $('#thingtype').val() == 'RACK') $('.rack').show(); else $('.rack').hide();
		
		/*
		if((thing.imageFile === null || thing.imageFile === '') && (thing.imageData === null || thing.imageData === '')) {
			console.log('no image for this thing');
			$("#thingimg").attr('src', 'img/none.png');
		}
		else if(thing.imageData != null ) {
			console.log('image found: DATA_URL');
			$("#thingimg").attr('src', thing.imageData);
		}
		else {
			console.log('image found: FILE_URI');
			$("#thingimg").attr('src', thing.imageFile);
		}
		*/
		

		$("#thingimg").attr('src', getImageSrc(thing));


		$('.thingcur').show();
		
			$('#children').hide();
			$('#children').html('<div id="childrenind" class="row text-center">Contains</div>');
			//$('#children').append('<div class="row" id="childrow"></div>');
			
			//$('<ul></ul>').appendTo('#children');
			
			getChildren(thing.id, function(child) {
/*				$('#children ul').append(`<li>
<a href="#"><img src="${child.imageFile}" class="thumb child"> ${ child.name }</a>
</li>`);
*/
				var shortName = getShortName(child);
				var childImage = getImageSrc(child);
				
				$('#children').append(`<div class="child" onClick="thingDetail('${ child.id }')">
	<div class="text-center">
	<img src="${childImage}" class="child img-rounded">
	</div>
	<div class="text-center">
		${ shortName }
	</div>
</div>`);
				$('#children').show();
			});
			
/*				//alert(thing.Child.length);
			for (i=0; i<thing.Child.length; i++) {
				//alert(thing.Child[i].name);
				$('<li onclick="thingDetail('+thing.Child[i].id+'); return false;"><p>'+thing.Child[i].name+'</p><img class="thumb" src="'+thing.Child[i].Image[0].image_path+'"></li>').appendTo('#children ul');
			}
*/
		
		if (thing.parentId == null || thing.parentId == 0) {
			$("#parent").html('');
			$("#parentname").html('');
			$("#parentimg").attr('src', 'img/none.png');
			$("#pimg").attr('src', 'img/none.png');
			$(".tMain").removeClass('col-xs-8');
			$(".tMain").addClass('col-xs-12');
			$(".tInfo").hide();
			$(".removebtn").hide();
	
		}
		else {

			//$("#parentind").show();
			$("#parent").html(thing.parentId);
			/// TODO get parent 
			
			$(".tMain").removeClass('col-xs-12');
			$(".tMain").addClass('col-xs-8');
			$(".tInfo").show();
			$(".removebtn").show();
	
			getThing(thing.parentId, function(parnt) {
				var parentImage = getImageSrc(parnt);
				
				$("#parentimg").attr('src', parentImage);
				$("#pimg").attr('src', parentImage);
			
				$("#parentname").html(parnt.name);
				
				$("#pname").html(parnt.name);
				
				if (parnt.type == 'RACK') {
					console.log('israck');
					$("#pname").html(parnt.name + ' ['+thing.rack_position+']');
				}

				rackPositionChooser(parnt);
				
				$('.parentcur').show();				
			},
			function() {
				
			});

		}	
	},
	function() {
		/// getThing fails
		console.log('getThing not found');
		resetThing();
		resetParent();
		status_msg("New");
		$('#thing').html(tid);
		$('.parentcur').hide();
		return true;
	});
	return true;
	

}


function rackPositionChooser(parentThing) {
	console.log('rack choose ' + parentThing.type);
	if (parentThing.type == 'RACK') {
		// This is a rack parent, so show position selectors
			console.log('Is rack');
		// Parse positions
		var len = $("#rackposition").val().length;
		var letter = $("#rackposition").val()[0];
		var number = parseInt($("#rackposition").val().substring(1,len));
		console.log('rack position: ' + letter + '-' + number);
		
// Drop downs for row and collapse
	$('#rackpossel').html(`<table id="rackpost" border="1" width="100%">
</table>
`);

		var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var col = '';
		var selected = '';
		for(var j = 1; j < parseInt(parentThing.rack_rows)+1; j++) {
			selected = (j == number) ? ' selected' : '';
			//$('#posrow').append(`<option value="${ j }"${ selected }>${ j }</option>`);
			$('#rackpost').append(`<tr id="row${ j }"></tr>`);
			
			for(var i = 0; i < parentThing.rack_cols; i++) {
				var col = alphabet[i];
				selected = (col == letter && j == number) ? 'selected' : '';
				$('#row'+j).append(`<td data-position="${col + j}" class="${ selected }">${col + j}</td>`);
			}
		}
	/*	

		if (parentThing.rack_cols < 2) $('#rackposcol').hide();
		if (parentThing.rack_rows < 2) $('#rackposrow').hide();
		*/	

		
		// change handlers because these are new elements (bad idea?)
		
		$('#rackpost > tr > td').click(function() {
			$('#rackpost td').removeClass('selected');
			$('#rackposition').val($(this).attr('data-position'));
			$(this).addClass('selected');
			$('.savebtn').show();

		});

		$('.rackposition').show();
	
	}
	else {
		$('#rackpossel').html();
		$('.rackposition').hide();
	}	

}
function rackPositionChooserDD(parentThing) {
	console.log('rack choose ' + parentThing.type);
	if (parentThing.type == 'RACK') {
		// This is a rack parent, so show position selectors
			console.log('Is rack');
		// Parse positions
		var len = $("#rackposition").val().length;
		var letter = $("#rackposition").val()[0];
		var number = parseInt($("#rackposition").val().substring(1,len));
		console.log('rack position: ' + letter + '-' + number);
		
// Drop downs for row and collapse
	$('#rackpossel').html(`<div id="rackposcol">
<select id="poscol" class="curdirty"></select>
</div>
<div id="rackposrow">
<select id="posrow" class="curdirty"></select>
</div>

`);

		var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var col = '';
		var selected = '';
		for(var i = 0; i < parentThing.rack_cols; i++) {
			var col = alphabet[i];
			selected = (col == letter) ? ' selected' : '';
			$('#poscol').append(`<option value="${ col }"${ selected }>${ col }</option>`);
		}

		for(var i = 1; i < parseInt(parentThing.rack_rows)+1; i++) {
			selected = (i == number) ? ' selected' : '';
			$('#posrow').append(`<option value="${ i }"${ selected }>${ i }</option>`);
		}
		
		if (parentThing.rack_cols < 2) $('#rackposcol').hide();
		if (parentThing.rack_rows < 2) $('#rackposrow').hide();
		

		
		// change handlers because these are new elements (bad idea?)
		
		$('#poscol').change(function() {
			$('#rackposition').val($('#poscol').val() + $('#posrow').val());
			$('.savebtn').show();

		});
		$('#posrow').change(function() {
			$('#rackposition').val($('#poscol').val() + $('#posrow').val());
			$('.savebtn').show();
		});

		$('.rackposition').show();
		
	}
	else {
		$('#rackpossel').html();
		$('.rackposition').hide();
	}	
}

function moveThing(tid) {
	$(".parentcur").hide();
	resetParent();
	
	getThing(tid, function(thing) {
		$("#parent").html(thing.id);
		$("#parentname").html(thing.name);
		$("#pname").html(thing.name);
		
		var parentImage = getImageSrc(thing);
		$("#parentimg").attr('src', parentImage);
		$("#pimg").attr('src', parentImage);

		// Reset rack position
		$("#rackposition").val('A1');

		rackPositionChooser(thing);
		
		$(".tMain").removeClass('col-xs-12');
		$(".tMain").addClass('col-xs-8');
		$(".tInfo").show();
		$(".removebtn").show();		
			
		$('.parentcur').show();
		return true;
	},
	function() {
		resetParent();
		status_msg("New");
		$('#parent').html(tid);
		$('#parentname').html("New Thing");
		$('.parentcur').show();
		return true;
	});
	
	return true;
}

function setNewTid(current, to_be) {
	updateTid(current, to_be, function() {
		$('#thing').html(to_be);
		$('#settag').hide();
	},
	function() {
		status_msg('That did not work');
	});
}

function switch_toplevel(newtoplevel) {
	toplevel=newtoplevel;
  $('.toplevel').hide();
  $(newtoplevel).show();
  return true;
}



function completeScanQr(tag, mode) {
	console.log('completeScanQr');
	
	$('#scanqr').hide();

	if ( receiveTag(tag, mode) == false ) {
		status_msg('Invalid');
	}
	$('#recent').html();
	
	updateRecent();
		
	return true;

}


function take_snapshot(destination, tid) {

	Webcam.snap( function (data_uri) {
		$(destination).attr('src', data_uri);  // Put image in destination
		Webcam.upload( $(destination).attr('src'), '/api/things/storeImage/'+$(tid).html(), function(code, text) {
			$('#ajaxout').html(code + '{' + text + '}');
		});
	});
	return true;
}

function validateTag(tag) {

return TID_THING;

  switch(tag.substring(0, 1)) {
    case 'T' :
      return TID_THING;
      break;
//    case 'TP' :
//     return TID_PLACE;
//     break;
    default :
      return TID_INVALID;
  }
}

function idFromThingTag(tag) {

return tag;
  return tag.substring(2, tag.length) * 1;
}

function status_msg(msg) {
  $('#status').html(msg);
  //return setTimeout( status_msg_clear, 1000);
  return setTimeout( function () { $('#status').html(''); } , 1000);
}

//function status_msg_clear() {
//  $('#status').html('');
//}

function receiveTag(tag, mode) {
	console.log('receiveTag '+tag+' ' + mode);
	//alert(tag + ' ' + mode);
	typ = validateTag(tag);

  if (typ == TID_INVALID) {
	  alert('invalid');
	  return false;
  }
  tid = idFromThingTag(tag);

	var now = new Date();
    var scanned = Math.round(now.getTime() / 1000);	
	updateThingField(tid, 'time_scanned', scanned, function() {console.log('updated time scanned');});
  
  switch (mode) {
	case 'move':
		if (! moveThing(tid)) {		  
			//alert('not found');
			$("#parentname").html("New thing");
		  }
		$('.savebtn').show();
		break;
	case 'set':
		if (! setNewTid($('#thing').html(), tid)) {		  
			//alert('not found');
			$("#parentname").html("New thing");
		  }
		$('.savebtn').show();
		break;
	default:
		if (! lookupThing(tid)) {		  
			// Not found (new thing)
			alert('lookup thing not found');
			$("#thing").html(data);
//			$("#thingimg").attr('src', '/img/none.png');
			$("#thingname").val("New thing");
		  }

	break;
	
  }

  $('.thingcur').show();
  $('#current').show();	
	

  return true;
}

function updateRecent() {
	$("#recent").html('');
	
	getRecent(function(recent) {
		var recentImage = getImageSrc(recent);
		var shortName = getShortName(recent);
		$("#recent").append(`<div class="recent">
	<div class="text-center">
	<a href="#" onClick="chooseRecent('${ recent.id }');">
		<img src="${recentImage}" class="recent img-rounded">
	</a>
	</div>
	<div class="text-center">
		${ shortName }
	</div>
</div>`);
	});
}

function updateAll() {
	
	getThingsFromServer(function(junk, remoteThings) {
			console.log(remoteThings);

		getAllThings(false, function(things) {
			console.log(things);
			for(x=0; x<things.rows.length; x++) {
				console.log('index '+x);
				
				var thing = things.rows.item(x);
				console.log(thing.id, thing.name);
				thing.user_id = userId;
				
				remoteThing = false;
				console.log(remoteThings.length);
				for(var y=0; y<remoteThings.length; y++) {
					console.log(remoteThings[y].name);
						if (remoteThings[y].thing_id == thing.id) {
							remoteThing = remoteThings[y];
							break;
						}
				}
				
				if (remoteThing == false) {
					console.log("can't find remote " + thing.id);
				}
				else {
					console.log("found remote " + thing.id);
					
				}
				return true;
				
				getThingFromServer(thing, function(thing, remoteThing) {
					console.log(remoteThing);
					if (remoteThing == "") {
						//console.log('not found '+thing.name);
						addOnServer(thing);
					}
					else {
						remoteThing = JSON.parse(remoteThing);
						//console.log('remote', remoteThing);
						//console.log('local', thing);
						//console.log(remoteThing.time_modified, thing.time_modified);
						if (remoteThing.time_modified < thing.time_modified) {
							//console.log('thing has been updated ' + thing.id);
							updateOnServer(thing);
						}
					}
				});

				//things[x].user_id = userId;
				//console.log(thing[x]);
				//updateFieldOnServer(things[x], 'name');
			}
		}, 1000);
		
	});
	return true;
	

}