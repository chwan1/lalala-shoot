google.load("earth", "1");
google.load("maps", "2");

var ge = null;
var cam;

var Model;
var ModelLocation;
var Location;

var lat = 25.068341;
var log = 121.555438;
/*var lat = 40.74412222;
var log = -73.99576944;*/
var offset = 0.00002;

function init() {
  google.earth.createInstance("map3d", init3D, failure3D);
  init2D();
}
var hitTestBoundsPolygon ;
function init3D(object) {
  ge = object;
  ge.getOptions().setFlyToSpeed(100);
  ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
  
  cam = new FirstPersonCam();
  cam.updateCamera();
  ge.getWindow().setVisibility(true);

	google.earth.addEventListener(ge.getWindow(), "mouseup", function(){window.focus();}, false);
	
	google.earth.addEventListener(ge.getView(), 'viewchange', function(evt) {
		if(hitTestBoundsPolygon)
			map.removeOverlay(hitTestBoundsPolygon);

		var totalBounds = new GLatLngBounds();

		var hitThere = ge.getView().hitTest(0.5, ge.UNITS_FRACTION, 0.51, ge.UNITS_FRACTION, ge.HIT_TEST_GLOBE);
		var hitHere = ge.getView().hitTest(0.5, ge.UNITS_FRACTION, 1, ge.UNITS_FRACTION, ge.HIT_TEST_GLOBE);

		if (hitThere && hitHere) {
		  hitTestBoundsPolygon = new GPolyline([
			  new GLatLng(hitThere.getLatitude(), hitThere.getLongitude()),
			  new GLatLng(hitHere.getLatitude(), hitHere.getLongitude())],
			  '#ff0000', 2, 1.00,
			  '#ff0000',    0.25,
			  { clickable: false });
		  map.addOverlay(hitTestBoundsPolygon);

		  var polyBounds = hitTestBoundsPolygon.getBounds();
		  totalBounds.extend(polyBounds.getNorthEast());
		  totalBounds.extend(polyBounds.getSouthWest());
		  I.setLatLng(new GLatLng(hitHere.getLatitude(), hitHere.getLongitude()));
		  map.setCenter(new GLatLng(hitHere.getLatitude(), hitHere.getLongitude()));
		}
	});
	
/*var pentagon = ge.parseKml(
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<kml xmlns="http://earth.google.com/kml/2.1">' +
  '  <Placemark>' +
  '    <name>The Pentagon</name>' +
  '    <Polygon>' +
  '      <altitudeMode>relativeToGround</altitudeMode>' +
  '      <outerBoundaryIs>' +
  '        <LinearRing>' +
  '          <coordinates>' +
               (log - offset).toString() + ', ' + (lat + offset).toString() + ', 4 ' +
               (log + offset).toString() + ', ' + (lat + offset).toString() + ', 4 ' +
               (log + offset).toString() + ', ' + (lat - offset).toString() + ', 4 ' +
               (log - offset).toString() + ', ' + (lat - offset).toString() + ', 4 ' +
               (log - offset).toString() + ', ' + (lat + offset).toString() + ', 4 ' +
  '          </coordinates>' +
  '        </LinearRing>' +
  '      </outerBoundaryIs>' +
  '    </Polygon>' +
  '  </Placemark>' +
  '</kml>');
ge.getFeatures().appendChild(pentagon);*/
	
	/*google.earth.addEventListener(pentagon, "mouseover", function (event) {
		ge.getFeatures().removeChild(pentagon);
	});*/
	
	createModel(lat, log, 0);
	createModel(lat, log-0.0001, 1);
	createModel(lat, log-0.001, 2);
	createModel(lat, log+0.003, 3);
	//google.earth.addEventListener(ge, "frameend", moveMons);
}

function failure3D(object) {}

var map;
var I;
function init2D() {
    map = new GMap2(document.getElementById("map2d"));
    map.setCenter(new GLatLng(lat, log), 14);//越大越近

    /*var mapui = map.getDefaultUI();
    mapui.maptypes.physical = false;
    map.setUI(mapui);*/
    map.setMapType(G_NORMAL_MAP);
    
	var customIcon = new GIcon(G_DEFAULT_ICON);
    customIcon.image = 'http://maps.google.com/mapfiles/dd-start.png';
	I = new GMarker(new GLatLng(lat, log), { icon: customIcon });
    map.addOverlay(I);
      
    // create a polygon
    /*var polygon = new GPolygon([
        new GLatLng(37.82388,-122.49341),
        new GLatLng(37.82550,-122.49141),
        new GLatLng(37.82458,-122.49319),
        new GLatLng(37.82388,-122.49341)
       ], "#4400ff", 1, 1.0, "#4400ff", 0.5);*/
}

var MAX_NUM = 10;
var placemark = new Array(MAX_NUM);
var model = new Array(MAX_NUM);
var link = new Array(MAX_NUM);
var loc = new Array(MAX_NUM);
var point = new Array(MAX_NUM);
var mulgeo = new Array(MAX_NUM);
var height = 10;

function createModel(lat, log, i)
{
	// Placemark
	placemark[i] = ge.createPlacemark('');
	placemark[i].setGeometry(ge.createMultiGeometry(''));
	mulgeo[i] = placemark[i].getGeometry().getGeometries();

	// Placemark/Model (geometry)
	model[i] = ge.createModel('');
	model[i].setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
	mulgeo[i].appendChild(model[i]);

	// Placemark/Model/Link
	link[i] = ge.createLink('');
	link[i].setHref('http://140.112.18.211/white/smart.dae');
	model[i].setLink(link[i]);
	
	// Placemark/Model/Location
	loc[i] = ge.createLocation('');
	loc[i].setLatitude(lat);
	loc[i].setLongitude(log);
	loc[i].setAltitude	(10.0);
	model[i].setLocation(loc[i]);
	
	/*point[i] = ge.createPoint('');
	point[i].setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
	point[i].setLatitude(lat);
	point[i].setLongitude(log);
	point[i].setAltitude(10.0);
	mulgeo[i].appendChild(point[i]);*/
	

	/*var reg = ge.createRegion('');
	var latLonAltBox = ge.createLatLonAltBox('');
	latLonAltBox.setAltBox(lat + offset, lat - offset, log + offset, log - offset, 0, 0, 10, ge.ALTITUDE_ABSOLUTE);
	reg.setLatLonAltBox(latLonAltBox);
    mulgeo[i].appendChild(reg);*///說不定能用這個?
	
	var polygon = ge.createPolygon('');
	polygon.setAltitudeMode(ge.ALTITUDE_ABSOLUTE);
	polygon.setExtrude(true);
	polygon.setTessellate(true);
	//polygon.setFill(false);
	mulgeo[i].appendChild(polygon);
	
	var outer = ge.createLinearRing('');
	polygon.setOuterBoundary(outer);
	var coords = outer.getCoordinates();
	coords.pushLatLngAlt(lat - offset, log - offset, height);
	coords.pushLatLngAlt(lat - offset, log + offset, height);
	coords.pushLatLngAlt(lat + offset, log + offset, height);
	coords.pushLatLngAlt(lat + offset, log - offset, height);
	
	var marker = new GMarker(new GLatLng(lat, log));
    map.addOverlay(marker);
	
    google.earth.addEventListener(placemark[i], "mouseover", function (event) {
		ge.getFeatures().removeChild(placemark[i]);
		map.removeOverlay(marker);
	});

	ge.getFeatures().appendChild(placemark[i]);
	
}
	
function moveMons(){
	lat = lat - 0.000001;
	point.setLatitude(lat);
	loc.setLatitude(lat);
	
	/*mulgeo.removeChild(polygon);
	polygon = ge.createPolygon('');
	mulgeo.appendChild(polygon);
	
	var outer = ge.createLinearRing('');
	polygon.setOuterBoundary(outer);
	var coords = outer.getCoordinates();
	coords.pushLatLngAlt(lat - offset, log - offset, 10);
	coords.pushLatLngAlt(lat - offset, log + offset, 10);
	coords.pushLatLngAlt(lat + offset, log + offset, 10);
	coords.pushLatLngAlt(lat + offset, log - offset, 10);*/
}

function setloc(i_lat, i_log){
	lat = i_lat;
	log = i_log;
	init3D(ge);
	init2D();
}
	