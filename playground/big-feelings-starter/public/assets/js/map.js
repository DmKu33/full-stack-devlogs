//////////////////////////////////////
/////////// INITIALIZE MAP ///////////
//////////////////////////////////////

// array to hold markers
let markerLayer = [], visibleMarkerPoints = 0;

// add map
var map = L.map("map", {
    center: [20, -25],
    zoom: 3,
});

// url for tileset
let tiles = "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
tiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"

// add tile layer
L.tileLayer(tiles, {
    maxZoom: 14,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

/**
 *  Called (by main.js) on load and after form submission
 */
function updateMap(data) {
    // 👉 add code inside this function (Chapter 10) ...
    removeMarkers();
    data.forEach((row) => markerLayer.push(createMarker(row)));
    // 👈
    afterUpdateMap();
}

function afterUpdateMap(){
    if (data.length > 0 && markerLayer.length > 0) 
        updateColorGradients();
}

/**
 *  Create and add feeling CircleMarker to map
 * 	https://leafletjs.com/reference.html#circlemarker
 */
function createMarker(row) {
    let marker = L.circleMarker([row.lat, row.lng], {
        radius: randomInt(70, 90),
        stroke: false,
        fillColor: getRadialGradientDef(row.color),
        fillOpacity: getFillOpacity(),
    });
    let popup = L.popup({ className: "popup-wrapper" })
        .setContent(`<span class="popup" style="color:${row.color};">${row.feeling}</span>`);
    marker
        .addTo(map).bindPopup(popup)
        .on('click', function () {
            console.log(`_id="${row._id}", feeling="${row.feeling}", color="${row.color}"`);
            // updatePopupBackgroundColor(row.color);
        });
    return marker;
}


//////////////////////////////////////
/////////////// EVENTS ///////////////
//////////////////////////////////////

// web form inside popup
let inputPopup = L.popup()
    .setLatLng(L.latLng([0, 0]))
    .setContent(getInputPopupContent(L.latLng([0, 0])));

function getInputPopupContent(latlng) {
    return `
    <form class="popupInput">
		<div class="row">
			<div class="col">
				<div class="select-box">
					<div class="options-container"></div>
					<div class="selected">How do you feel?</div>
				</div>
			</div>
		</div>

		<div class="row addYourOwn">
			<div class="col">
				<div id="color-wrapper">
					<input type="color" id="color" class="form-control" value="#dd00dd" title="Choose your color" />
				</div>
				<input type="text" id="text" class="form-control" style="width:85%" maxlength="140" placeholder="Share your feeling and a color" title="Add your text" />
			</div>
		</div>

		<div class="row mt-2">
			<div class="col-7">
				<input type="text" id="location" class="form-control w-100" maxlength="100" value="${latlng.lat},${latlng.lng}" placeholder="Zoom and click map to locate your feeling" />
			</div>
			<div class="col-5">
				<button type="button" class="btn btn-primary w-100 submitBtn">Submit</button>
			</div>
		</div>

		<div class="row">
			<div class="msg text-center"></div>
		</div>
	</form>`;
}


map.on("click", (e) => {
    // wrap latlng (reset coordinates on dateline -180 and +180 degrees)
    let latlng = L.latLng([e.latlng.lat, e.latlng.lng]).wrap();
    // prevent specific locations
    latlng.lat = Number(latlng.lat.toPrecision(5));
    latlng.lng = Number(latlng.lng.toPrecision(5));
    console.log("click", latlng);
    inputPopup.setLatLng(latlng);
    map.openPopup(inputPopup);
    // updatePopupBackgroundColor("white");
    let location = document.querySelector("#location");
    location.value = `${latlng.lat},${latlng.lng}`;
    document.querySelector(".submitBtn").addEventListener("click", submitForm);
    updateOptions(colors);
});

// close popups on zoom
map.on("zoomstart", (e) => {
    // map.closePopup(); // disabled
});

// update marker opacity
map.on("zoomend", (e) => {
    visibleMarkerPoints = countVisibleMarkerPoints();
    markerLayer.forEach(function (marker, i) {
        marker.setStyle({ fillOpacity: getFillOpacity() });
    });
});



//////////////////////////////////////
////////////// FUNCTIONS /////////////
//////////////////////////////////////

// remove all markers from the map
function removeMarkers() {
    for (let i = 0; i < markerLayer.length; i++) {
        // remove visible marker
        map.removeLayer(markerLayer[i]);
    }
    // empty the array
    markerLayer = [];

    // We are about to update markers on the map, so count the number of marker points 
    // (using global data object) that will be visible in the viewport in order to determine opacity
    visibleMarkerPoints = countVisibleMarkerPoints();
}


//////////////////////////////////////
/////////////// COLOR ////////////////
//////////////////////////////////////

/**
 * Update background color of popup to feeling color - No longer used
 */
// function updatePopupBackgroundColor(color) {
//     //console.log("updatePopupBackgroundColor()", color)
//     let wrapper = document.querySelector(".leaflet-popup-content-wrapper");
//     let tip = document.querySelector(".leaflet-popup-tip");
//     wrapper.style.backgroundColor = color;
//     tip.style.backgroundColor = color;
//     // let parent = document.querySelector(".leaflet-popup");
//     // parent.style.backgroundColor = color;
// }

/**
 * Return number of data points in current viewport to determine marker opacity
 */
function countVisibleMarkerPoints() {
    var bounds = map.getBounds();
    var count = 0;
    for (let i = 0; i < data.length; i++) {
        if (bounds.contains(L.latLng(data[i].lat, data[i].lng)))
            count++;
    }
    // console.log("visibleMarkerPoints", count);
    return count;
}

/**
 * Get opacity for a single marker based on number of markers 
 */
function getFillOpacity() {
    let opacity;
    if (visibleMarkerPoints <= 20) opacity = .35;
    else if (visibleMarkerPoints <= 50) opacity = .25;
    else if (visibleMarkerPoints <= 100) opacity = .2;
    else if (visibleMarkerPoints <= 200) opacity = .15;
    else if (visibleMarkerPoints <= 400) opacity = .1;
    else opacity = .05; // default
    // console.log(opacity);
    return opacity;
}

// to save color gradient definitions
let svgGradientDefs = {};

/**
 * Create and store the definition for each CircleMarker's radial gradient, and return it's ID
 */
function getRadialGradientDef(color) {
    let hex = color.replace("#", "");
    let colorId = `color_${hex}`;
    // console.log(colorId);
    // store it in saved definitions
    svgGradientDefs[colorId] = `
		<radialGradient id="${colorId}">
			<stop offset="5%" style="stop-color:#${hex}; stop-opacity:1" />
			<stop offset="95%" style="stop-color:#${hex}; stop-opacity:0" />
		</radialGradient>`;
    return `url('#${colorId}')`;
}
/**
 * Update color gradient definitions in SVG
 */
function updateColorGradients() {
    let defsString = "";
    for (const [key, value] of Object.entries(svgGradientDefs)) {
        defsString += value;
    }
    // if defs has already been added then update, otherwise create
    let defs = document.querySelector(".leaflet-overlay-pane svg defs")
    if (defs) {
        defs.innerHTML = defsString;
    } else {
        let svg = document.querySelector(".leaflet-overlay-pane svg");
        defs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
        defs.innerHTML = defsString;
        svg.appendChild(defs);
    }
    // check number added (testing)
    // defs = document.querySelector(".leaflet-overlay-pane svg defs")
    // console.log("defs.length", defs.length);
}