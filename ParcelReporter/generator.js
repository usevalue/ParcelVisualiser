var curatedReport;
var focus = null;
showReport();

// Put whatever parcel ID numbers you want in here to highlight them on the map
var highlights = [51100, 51099, 51120, 33810, 33811, 33812, 33805, 34662, 34614, 34615, 34594, 34593, 34590, 34591, 34582, 34568, 34581, 34580, 34169, 34193, 33771, 51067, 51067];

// Following codes are hard-coded into database in this exact order, so don't play around with this.
var brownfield_codes = ["none",
			"Brownfield Cleanup Program",
			"Environmental Restoration Program",
			"Resource Conservation and Recovery",
			"State Superfund Program",
			"Voluntary Cleanup Program"];

// Initialise map
var mymap = L.map('map', {renderer: L.canvas()}).setView([42.865835,-78.838839], 14);
// Add tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(mymap);

// Load plot info
var geo = L.geoJSON(parcels, {onEachFeature: onEach});
geo.addTo(mymap);

function onEach(feature, layer) {
	layer.on({
		'click': function(e) {
			focus = feature;
			showReport();
		}
	});
	var hlight = false;
	var i;
	for(i = 0; i<highlights.length; i++) {
		if (feature.properties.OBJECTID_1 == highlights[i]) hlight = true;
	}
	if(hlight) {
		layer.setStyle({color: '#0000FF', opacity: '0.9', fillOpacity: '0.7'});
	}
	else {
		layer.setStyle({opacity: '0.2'});
	}
}



function showReport() {
	curatedReport = document.getElementById("report_toggle").checked;
	var reportDisplay = document.getElementById("report_type_display");
	if(curatedReport)
		reportDisplay.innerHTML = "Curated report";
	else
		reportDisplay.innerHTML = "Infodump";
	if(focus == null) return;
	var showit = "report";
	if(curatedReport) showit= curated();
	else showit = infodump();
	document.getElementById('report_text').innerHTML=showit;
}

function infodump() {
	var rep = "";
	for(prop in focus.properties) {
		rep+= prop +": " + focus.properties[prop] + "<br/>";
	}
	return rep;
}

function curated() {
	var rep = "";
	var props = focus.properties;
	// Identifying info
	rep+="Parcel number "+props.OBJECTID_1;
	if(props.DESCR!==null)
		rep+=": "+props.DESCR;
	rep+="<br/><br/>";
	// Address information
	rep+="<b>Address</b><br/>";
	if(props.PARCELADDR!==null) {
		rep+= props.PARCELADDR+"<br/>"+props.MUNI_NAME+"<br/>"+props.LOC_ZIP+"<br/><br/>";
	}
	else rep+="No address recorded.<br/><br/>";

	// Owner info
	rep+="<b>Owner information</b><br/>";
	if(props.PRMY_OWNER!==null) {
		rep += "Primary owner: "+ props.PRMY_OWNER + "<br/>" +
			props.MAIL_ADDR + "<br/>" +
			props.MAIL_CITY + ", " +
			props.MAIL_STATE + "<br/>" +
			props.MAIL_ZIP + "<br/>";
		if(props.ADD_OWNER!==null) {
			rep+="<br/>Secondary owner: ";
			rep += ""+ props.ADD_OWNER + "<br/>" +
				props.ADD_ADDR + "<br/>" +
				props.ADD_CITY + ", " +
				props.ADD_STATE + "<br/>" +
				props.ADD_ZIP + "<br/>";
		}
	}
	else {rep+="No ownership data.<br/>"}
	rep += "<br/>";
	// Environmental info
	rep += "<b>Environmental information</b><br/>";
	if(props.LengShore>0) {
		rep += Math.round(props.LengShore) + " feet of shoreline<br/>";
	}
	else rep += Math.round(props.DistShore) + " feet from shore<br/>";
	rep += Math.round(props.DistPark) + " feet from a park <br/>";
	rep += Math.round(props.DistTrail) + " feet from a trail<br/>";
	if(props.Remed_Prgm == 0) rep+="No remediation program.";
	else {
		rep += "Remediation program:<br/><i>" + brownfield_codes[props.Remed_Prgm] + "</i>";
		if(props.Remed_Add1 !== null) {
			rep += " at " + props.Remed_Add1;
		}

	}
	rep += "<br/><br/>";

	// Financial info
	rep += "<b>Property value</b><br/>";
	var perAcre = Math.round(100*props.LAND_AV / props.CALC_ACRES)/100;
	rep += Math.round(100*props.CALC_ACRES)/100 + " acres<br/>";
	rep += "Land assessed at $" + props.LAND_AV + " ($" + perAcre + " per acre)<br/>";
	rep += "With improvements assessed at $" + props.TOTAL_AV;
	
	// Tax delinquency
	if(props.Taxes_Due>0) {
	    rep += "<br/>$"+props.Taxes_Due+" due in back taxes";
	    if(props.TaxDueYrs>0) {
	        rep += " for "+props.TaxDueYrs+" separate years";
	    }
	    if(props.TaxDueRcnt>0) {
	        rep += ", as recently as "+props.TaxDueRcnt;
	    }
	    rep += ".<br/>";
	}
	
	return rep;
}
