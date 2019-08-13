// Start by calling Leaflet (L) to initialise a map with the canvas renderer.
// Next, centre the map at a certain point with a certain scale
var mymap = L.map('the_map', {renderer: L.canvas()}).setView([42.915393,-78.86], 13);

// Dataset values
var brownfield_codes = ["none",
						"Brownfield Cleanup Program",
						"Environmental Restoration Program",
						"Resource Conservation and Recovery",
						"State Superfund Program",
						"Voluntary Cleanup Program"] 
var price_breaks = [0, 1200, 10000, 68000, 460000, 3100000, 21000000, 145000000]

// Initialise display variables
var colour_by = "default";
var vacancy_filter = 'none';
var public_filter = 'none';
var minimum_water_distance = 0;
var maximum_water_distance = 150000;
var minimum_park_distance = 0;
var maximum_park_distance = 50000;
var minimum_trail_distance = 0;
var maximum_trail_distance = 130000;
var hidden_style = {fill: false, stroke: false};

// For toggling overlay layers
var highlight_greenspaces = document.getElementById("hl_green").checked;
var highlight_remediation = document.getElementById("hl_remediation").checked;
var highlight_delinquent = document.getElementById("hl_delinquent").checked;
var highlight_waterways = document.getElementById("hl_waterways").checked;
var highlight_preservation = document.getElementById("hl_preservation").checked;
var highlight_wetlands = document.getElementById("hl_wetlands").checked;

var count_display = 0;
var count_total = 0;

// Add map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(mymap);

// Load overlay layers
var greenspaces = L.geoJson(greens).setStyle({"color": "#22FF22", "weight": "2", interactive: false});
var waterways = L.geoJson(water_data).setStyle({"color": "#2288EE", "weight": "2", interactive: false});
var preservation_areas = L.geoJson(preservation).setStyle({"color": "#FF6666", "weight": "2", interactive: false});
var remediation_sites = L.geoJson(remediation_zones).setStyle({"color": "#CCCC00", "weight": "2.2", fillOpacity: '0', interactive: false});
var wetlands = L.geoJson(wetland_data).setStyle({"color": "#22CCEE", "weight": "2", interactive: false});

// Call the draw function on load
var testing=0;
draw_parcels();

/*  Uncomment this to automatically add all parcels to the map (testing purposes)
greenspaces.addTo(mymap);
waterways.addTo(mymap);
preservation_areas.addTo(mymap);
wetlands.addTo(mymap);
remediation_sites.addTo(mymap);
*/

//var preservation_zones = L.geoJson(preservation).setStyle({"color": "#666666"}).addTo(mymap);

// Deceptively simple.  "parcels" refers to variable declaration in the .geojson file linked from index.html
function draw_parcels() {
 	count_display=0;
	count_total=0;

	plots = L.geoJson(parcels, {
		onEachFeature: onEach
	});

	plots.addTo(mymap);
	
	// Highlight layers
	if(highlight_greenspaces) 
		greenspaces.addTo(mymap);
	if(highlight_waterways) 
		waterways.addTo(mymap);
	if(highlight_preservation) 
		preservation_areas.addTo(mymap);
	if(highlight_remediation)
		remediation_sites.addTo(mymap);
	if(highlight_wetlands) 
		wetlands.addTo(mymap);

	// Display key for selected color scheme
	var keychain = document.getElementsByClassName('key');
	for(i = 0; i < keychain.length; i++) {
		keychain[i].style.display="none";
	}
	if(colour_by!="default") {
		document.getElementById(colour_by+"_key").style.display = "inline";
	}
	// Display count of parcels
	document.getElementById('parcel-count').innerHTML = count_display;
	document.getElementById('parcel-total').innerHTML = count_total;
}

// Controlling how each feature displays

function onEach(feature, layer) {
	count_total++;
	
	// Run filters
	if(
		(vacancy_filter=='require' && feature.properties.Vacant==0) ||
		(vacancy_filter=='exclude' && feature.properties.Vacant==1) ||
		(public_filter=='require' && feature.properties.Ownr_Ctgry<1) ||
		(public_filter=='exclude' && feature.properties.Ownr_Ctgry>0) ||
		(feature.properties.DistShore>maximum_water_distance) || 
		(feature.properties.DistShore<minimum_water_distance) ||
		(feature.properties.DistPark>maximum_park_distance) || 
		(feature.properties.DistPark<minimum_park_distance) ||
		(feature.properties.DistTrail>maximum_trail_distance) ||
		(feature.properties.DistTrail<minimum_trail_distance) ||
		(!document.getElementById('price0').checked && feature.properties.TOTAL_AV<=price_breaks[0]) ||
		(!document.getElementById('price1').checked && feature.properties.TOTAL_AV > price_breaks[0] &&
			feature.properties.TOTAL_AV <= price_breaks[1]) ||
		(!document.getElementById('price2').checked && feature.properties.TOTAL_AV > price_breaks[1] &&
			feature.properties.TOTAL_AV <= price_breaks[2]) ||
		(!document.getElementById('price3').checked && feature.properties.TOTAL_AV > price_breaks[2] &&
			feature.properties.TOTAL_AV <= price_breaks[3]) ||
		(!document.getElementById('price4').checked && feature.properties.TOTAL_AV > price_breaks[3] &&
			feature.properties.TOTAL_AV <= price_breaks[4]) ||
		(!document.getElementById('price5').checked && feature.properties.TOTAL_AV > price_breaks[4] &&
			feature.properties.TOTAL_AV <= price_breaks[5]) ||
		(!document.getElementById('price6').checked && feature.properties.TOTAL_AV > price_breaks[5] &&
			feature.properties.TOTAL_AV <= price_breaks[6]) ||
		(!document.getElementById('price7').checked && feature.properties.TOTAL_AV > price_breaks[6] &&
			feature.properties.TOTAL_AV <= price_breaks[7]) ||
		(!document.getElementById('price8').checked && feature.properties.TOTAL_AV > price_breaks[7])
	) {
		layer.setStyle(hidden_style);
	}
	
	//Display the feature
	else {
		// Set fill
		var emphasis = getEmphasis(feature);
		var opacity = 1;
		if(colour_by=="default") opacity = 0.5;
		var shade = getShade(feature);
		layer.setStyle({
			weight: emphasis, // Highlighted features have heavier lines
			fillOpacity: opacity,
			fillColor: shade,
			strokeOpacity: 1
		});
		if(highlight_delinquent && feature.properties.Taxes_Due>0)
			layer.setStyle({color: "#FF0000"});
		else if(colour_by=="default")
			layer.setStyle({color: '#333333'});
		else
			layer.setStyle({color: '#000000'});
		layer.bindPopup(getPopup(feature)); // Attach parcel infobox
		count_display++;
	}
	
}

function getEmphasis(feature) {
	if(highlight_remediation && feature.properties.Remed_Prgm>0 ||
	   highlight_delinquent && feature.properties.Taxes_Due > 0)
		return 4;
	else return 0.5;
}

function getShade(feature) {
	if(colour_by == 'price') {
		var p = feature.properties.TOTAL_AV;
		return 	p > price_breaks[7] ? '#8c2d04' :
				p > price_breaks[6] ? '#d94801' :
				p > price_breaks[5] ? '#f16913' :
				p > price_breaks[4] ? '#fd8d3c' :
				p > price_breaks[3] ? '#fdae6b':
				p > price_breaks[2] ? '#fdd0a2' :
				p > price_breaks[1] ? '#fee6ce' :
				p > 0 ? '#fff5eb' :
						'#000000';
	}
	if(colour_by == 'water') {
		var w = feature.properties.DistShore;
		return	w == 0 ? '#045a8d' :
				w < 100 ? '#2b8cbe' :
				w < 400 ? '#74a9cf' :
				w < 1000 ? '#a6bddb' :
				w < 5280 ? '#d0d1e6' :
				'#f1eef6';
	}
	if(colour_by == 'park') {
		if(feature.properties.PROP_CLASS == 590 ||
			feature.properties.PROP_CLASS == 885 ||
			feature.properties.PROP_CLASS == 961 ||
			feature.properties.PROP_CLASS == 962 ||
			feature.properties.PROP_CLASS == 963 ||
			feature.properties.PROP_CLASS == 970 ||
			feature.properties.PROP_CLASS == 971 ||
			feature.properties.PROP_CLASS == 972)
			return '#00DD00';
		var w = feature.properties.DistPark;
		return	w < 100 ? '#006d2c' :
				w < 400 ? '#2ca25f' :
				w < 1000 ? '#66c2a4' :
				w < 5280 ? '#b2e2e2' :
				'#edf8fb';
	}
	if(colour_by == 'trail') {
		var w = feature.properties.DistTrail;
		return	w < 100 ? '#006d2c' :
				w < 400 ? '#2ca25f' :
				w < 1000 ? '#66c2a4' :
				w < 5280 ? '#b2e2e2' :
				'#edf8fb';
	}
	return '#8877AA';
}

function getPopup(feature) {
	var info = "";
	if(feature.properties.PARCELADDR==null || typeof feature.properties.PARCELADDR=='undefined')
		info = "No address on record.<br/>";
	else
		info = "<b>"+feature.properties.PARCELADDR+",<br/>"+feature.properties.MUNI_NAME+"</b><br/>";
	if(feature.properties.DESCR !== null && typeof feature.properties.DESCR !=='undefined')
		info += feature.properties.DESCR+"<br/>";
	if(typeof feature.properties.PRMY_OWNER !== 'undefined' && feature.properties.PRMY_OWNER !== null) {
		info += "Owned by "+feature.properties.PRMY_OWNER;
		if(typeof feature.properties.ADD_OWNER !== 'undefined' && feature.properties.ADD_OWNER !== null)
			info += ",<br/>"+  feature.properties.ADD_OWNER;
		info += "<br/>";
	}
	info += "<br/>";
	if(feature.properties.Area !== null && typeof feature.properties.Area !=='undefined')
		info += feature.properties.Area.toFixed(0) + " square feet<br/>";
	if(feature.properties.TOTAL_AV !== null && feature.properties.TOTAL_AV!==0)
		info +="Assessed at $"+feature.properties.TOTAL_AV+"<br/>";
	if(feature.properties.Taxes_Due > 0)
		info += feature.properties.Taxes_Due + " owed in tax<br/>";
	if(feature.properties.LengShore>0)
		info += feature.properties.LengShore.toFixed(0) + " feet of shoreline<br/>";
	if(feature.properties.Remed_Prgm>0)
		info += brownfield_codes[feature.properties.Remed_Prgm]+"<br/>";
	return info;
}

function refresh() {
	plots.remove();
	greenspaces.remove();
	waterways.remove();
	preservation_areas.remove();
	remediation_sites.remove();
	wetlands.remove();
	draw_parcels();
}

function changeScheme(c) {
	// Update the colour scheme
	colour_by = c;
	
	// Make sure all of the map keys are hidden.

	// Refresh the map with new colours
	refresh();
}


function updateDisplay() {
	// Read the sliders
	minimum_water_distance = $( "#water-slider" ).slider( "values", 0 );
	maximum_water_distance = $( "#water-slider" ).slider( "values", 1 );
	minimum_trail_distance = $( "#trail-slider" ).slider( "values", 0 );
	maximum_trail_distance = $( "#trail-slider" ).slider( "values", 1 );
	minimum_park_distance = $( "#park-slider" ).slider( "values", 0 );
	maximum_park_distance = $( "#park-slider" ).slider( "values", 1 );
	// Redraw
	refresh();
}
