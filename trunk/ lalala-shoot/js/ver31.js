google.load("earth", "1");
google.load("maps", "2");

var shimmer = document.createElement('iframe');
shimmer.id='shimmer';
shimmer.style.position='absolute';
shimmer.style.width='100%';
shimmer.style.height='100%';
shimmer.style.zIndex='999';
shimmer.style.top='0';
shimmer.style.left='0';
shimmer.style.opacity='0';
shimmer.setAttribute('frameborder','0');

var ge = null;
var map;
var I;
var second_time_play_bool;
var hitTestBoundsPolygon;
var cam;
var MAX_NUM_WITH_MOVE = 11;	// = MAX_NUM + 1
var lat_indi = new Array(MAX_NUM_WITH_MOVE);   //The Extra one is for Movement
var log_indi = new Array(MAX_NUM_WITH_MOVE);   //lat[MAX_NUM], log[MAX_NUM]
function init3D(object) {
	ge = object;
	ge.getOptions().setFlyToSpeed(100);
	ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
	ge.getWindow().setVisibility(true);

	function setPageFocus(){
		window.focus();} 
	google.earth.addEventListener(ge.getWindow(), "mouseup", setPageFocus, false);
      
	function GunShotSound(){
		$("#music_gun").jPlayer( {
			ready: function () {
				$(this).play();}});}
	google.earth.addEventListener(ge.getWindow(), "mousedown", GunShotSound, false);

	
	google.earth.addEventListener(ge.getView(), 'viewchange', function(evt) {
		if(hitTestBoundsPolygon){
			map.removeOverlay(hitTestBoundsPolygon);}

	var totalBounds = new GLatLngBounds();

	var hitThere = ge.getView().hitTest(0.5, ge.UNITS_FRACTION, 0.6, ge.UNITS_FRACTION, ge.HIT_TEST_GLOBE);
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
	
	map = new GMap2(document.getElementById("map2d"));
	var center = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	var lat_i = center.getLatitude();
	var lon_i = center.getLongitude();
    map.setCenter(new GLatLng(lat_i, lon_i), 14);//¶V¤j¶Vªñ
    map.setMapType(G_NORMAL_MAP);
    
	var customIcon = new GIcon(G_DEFAULT_ICON);
    customIcon.image = 'http://maps.google.com/mapfiles/dd-start.png';
	I = new GMarker(new GLatLng(lat_i, lon_i), { icon: customIcon });
    map.addOverlay(I);
	
	second_time_play_bool = false;
	UserWin = false;
	
	document.body.removeChild(shimmer);
}


var lat = 25.068341;
var log = 121.555438;
var user_height;
//Enemy Choice
/*1:Slime 2:Target 3:Chopper*/
var opponent = 1;
//Level Choice
/*1:Easy 2:Normal 3:Hard*/
var level = 0;
var total_time;
$(document).ready(function() { 
	var over = $("img[rel]").overlay({
				onBeforeLoad: function(){
					document.body.appendChild(shimmer);
				},
				onClose: function(){
					document.body.removeChild(shimmer);
				},
				expose: { 
					color: '#BAD0DB', 
					opacity: 0.7, 
					closeSpeed: 1000 
				},
				finish: {top: 0},
				speed: 1500,
				api: true
			}); 
	
	// thumbnail scrollable
	var scene = $("#thumbnails1").scrollable({
		size: 1, 
		clickable: false, 
		prevPage: ".prevPage1", 
		nextPage: ".nextPage1", 
		loop: true, 
		keyboard: false, 
		api: true
	});
	var me = $("#thumbnails2").scrollable({
		size: 1, 
		clickable: false, 
		prevPage: ".prevPage2", 
		nextPage: ".nextPage2", 
		loop: true, 
		keyboard: false, 
		api: true
	});
	var enemy = $("#thumbnails3").scrollable({
		size: 1, 
		clickable: false, 
		prevPage: ".prevPage3", 
		nextPage: ".nextPage3", 
		loop: true, 
		keyboard: false, 
		api: true
	});
	var difficulty = $("#thumbnails4").scrollable({
		size: 1, 
		clickable: false, 
		prevPage: ".prevPage4", 
		nextPage: ".nextPage4", 
		navi: ".navi4", 
		loop: true, 
		keyboard: false, 
		api: true, 
		speed: 0
	});

	document.body.appendChild(shimmer);
	$("#music_back_ground").jPlayer( {
		ready: function () {
			$(this).setFile('wav/back_long.mp3');
		}
	});
	$("#music_gun").jPlayer( {
		ready: function () {
			$(this).setFile('wav/GunShot.mp3'); // Defines the mp3
		}
	});
	$("#music_win").jPlayer( {
		ready: function () {
			$(this).setFile('wav/win.mp3'); // Defines the mp3
		}
	});
	$("#music_lose").jPlayer( {
		ready: function () {
			$(this).setFile('wav/lose.mp3'); // Defines the mp3
		}
	});
	
	function ini_game(){
		$("#music_back_ground").jPlayer( {
			ready: function () {
				$(this).stop();
			}
		});
		lat = LatArray[scene.getPageIndex()];
		log = LogArray[scene.getPageIndex()];

		user_height = UserHeightArray[me.getPageIndex()];
		//LEVEL CHOICE
		
		var temp = EnemyArray[enemy.getPageIndex()];
		link_text = temp.link_text;
		scale = temp.scale;
		height = temp.height;
		lat_shift = temp.lat_shift;
		log_shift = temp.log_shift;
		height_shift = temp.height_shift;
		$("#music_dead").jPlayer( {
			ready: function () {
				$(this).setFile(temp.sound); // Defines the mp3
			}
		});
		
		total_time = TotalTimeArray[difficulty.getPageIndex()];
		level = difficulty.getPageIndex();
		opponent = enemy.getPageIndex() + 1;


		if (UserWin == true){
			ge.getFeatures().removeChild(winplacemark);
			ge.setBalloon(null);
		}
		UserWin = false;
		
		if (second_time_play_bool === true){
			//Uncover Game Over Overlay
			if (Overlay_bool === true){
				Overlay_bool = false;
				//document.Watch2.watch2.value = Overlay_bool;
				ge.getFeatures().removeChild(screenOverlay);
			}
			
			//Remove original items
			for (var i = 0; i < handle; i++){
				ge.getFeatures().removeChild(placemark[i]);
				map.removeOverlay(marker[i]);
			}
		}
		
		second_time_play_bool = true;
		
		//DetermineUserHeight();
		cam = new FirstPersonCam();
		cam.updateCamera();
		
		//Enemy Place Initialization
		for (var i = 0; i < MAX_NUM; i++){
			lat_indi[i] = lat;
			log_indi[i] = log;
			STATE_REGISTER[i] = 0; //enemy registered as not present
		}
		
		//Add enemies
		CURRENT_NUM = INITIAL_ENEMY_ON;
		//NumberOnScreen = 0;
		//NumberDead = 0;
		
		//DetermineEnemy();
		height_move = height;
		for (handle = 0; handle < CURRENT_NUM; handle ++){
			DetermineLocation(handle,500,Math.random());
			scale_indi[handle] = ge.createScale('');
			scale_indi[handle].set(scale,scale,scale);
			createModel(handle);
			//NumberOnScreen += 1;
			STATE_REGISTER[handle] = 1;
		}
		
		EnemyCount();
		document.getElementById('enemy').innerHTML = NumberOnScreen;
		
		google.earth.addEventListener(ge, "frameend", moveMons);
		
		while (ge.getStreamingPercent() < 95)
		{ setTimeout("",1000); }

		var time = new Date();
		var hour_start = time.getHours();
		var min_start = time.getMinutes();
		var sec_start = time.getSeconds();
		document.getElementById('time').style.color = '#ddd';
		origin = hour_start * 3600 + min_start * 60 + sec_start;
		GameTime();
		
		$("#music_back_ground").jPlayer( {
			ready: function () {
				$(this).play();
			}
		});
		over.close();
	}
	
	$("#ini_game").click(ini_game);
	google.earth.createInstance("map3d", init3D, function(object){});
});

/************************************************       This is the part subject to change base on user choice***/
//Location Choice

var host = 'http://www2.ee.ntu.edu.tw/~b94901158/lalala/';
//User Choice
/*1:person 2:dinosaur 3:UFO*/
var my_user = 1;


/************************************************/



var INITIAL_ENEMY_ON = 4;
var MAX_NUM = 10;			//Total Enemy Number


var CURRENT_NUM;	//Enemy Number that has appeared
var NumberOnScreen; //Number of Enemy on the Screen
var handle;			//Counter when creating enemies
var NumberDead;
var STATE_REGISTER = new Array(MAX_NUM);

var now;
var origin;

var time_remaining;

var screenOverlay;
var Overlay_bool = false;
var timerID;
function GameTime(){
	var time = new Date();
	var hour = time.getHours();
	var min = time.getMinutes();
	var sec = time.getSeconds();
	
	now = hour * 3600 + min * 60 + sec;
	time_remaining = total_time - (now - origin);
	if (time_remaining <= 10)
	{
		document.getElementById('time').style.color = '#f00';
	}
	document.getElementById('time').innerHTML = time_remaining;
	
	//if (now - origin >= total_time){
	if (UserWin === false){
		if (time_remaining > 0){
			setTimeout(GameTime,150);}
		else {
			// ScreenOverlay
			screenOverlay = ge.createScreenOverlay('');

			// ScreenOverlay/Icon
			var icon = ge.createIcon('');
			//icon.setHref('http://www.google.com/intl/en_ALL/images/logo.gif');
			icon.setHref(host + 'image/gameover.JPG');
			screenOverlay.setIcon(icon);

			// Set screen position in pixels
			screenOverlay.getOverlayXY().setXUnits(ge.UNITS_FRACTION);
			screenOverlay.getOverlayXY().setYUnits(ge.UNITS_FRACTION);
			screenOverlay.getOverlayXY().setX(0.5);
			screenOverlay.getOverlayXY().setY(0.5);

			// Set object's size in pixels
			screenOverlay.getSize().setXUnits(ge.UNITS_FRACTION);
			screenOverlay.getSize().setYUnits(ge.UNITS_FRACTION);
			screenOverlay.getSize().setX(1);
			screenOverlay.getSize().setY(1);

			// add the screen overlay to Earth
			Overlay_bool = true;
			//document.Watch2.watch2.value = Overlay_bool;
			ge.getFeatures().appendChild(screenOverlay);
			//backMusic(6);
			//myGetMusic(6);
			$("#music_back_ground").jPlayer( {
				ready: function () {
					$(this).stop();
				}
			});
			$("#music_lose").jPlayer( {
				ready: function () {
					$(this).play();
				}
			});
			//clearTimeout(timerID);
		}
	}
//	if (Overlay_bool != 1) setTimeout("GameTime()",100);
	//document.Watch2.watch2.value = origin;
	
}

var placemark = new Array(MAX_NUM);
var mulgeo = new Array(MAX_NUM);

var model = new Array(MAX_NUM);
var link = new Array(MAX_NUM);
var loc = new Array(MAX_NUM);

var point = new Array(MAX_NUM);

var marker = new Array(MAX_NUM);

/************************************************ Enemy Related parameters**/
var link_text;
var lat_shift;
var log_shift;
var height_shift;
var height;
var scale;
var scale_indi = new Array(MAX_NUM);
var height_move;
/***************************************************************************/

function createModel(i){
	// Placemark
	placemark[i] = ge.createPlacemark('');
	placemark[i].setGeometry(ge.createMultiGeometry(''));
	mulgeo[i] = placemark[i].getGeometry().getGeometries();

	// Placemark/Model (geometry)
	model[i] = ge.createModel('');
	model[i].setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
	mulgeo[i].appendChild(model[i]);

	// Placemark/Model/Link
	link[i] = ge.createLink('');
	//link[i].setHref('http://140.112.18.211/white/smart.dae');
	link[i].setHref(host + link_text);
	model[i].setLink(link[i]);
	
	// Placemark/Model/Location
	loc[i] = ge.createLocation('');
	loc[i].setLatitude(lat_indi[i]);
	loc[i].setLongitude(log_indi[i]);
	loc[i].setAltitude	(height);
	model[i].setLocation(loc[i]);
	
	model[i].setScale(scale_indi[i]);
	
	//Point
	point[i] = ge.createPoint('');
	point[i].set(lat_indi[i] + lat_shift,log_indi[i] + log_shift,height + height_shift,ge.ALTITUDE_RELATIVE_TO_GROUND,false,true);
	mulgeo[i].appendChild(point[i]);
	
	//Add enemy on Map
	marker[i] = new GMarker(new GLatLng(lat_indi[i], log_indi[i]));
    map.addOverlay(marker[i]);
	
	//click to erase the enemy
	GEvent.addListener(marker[i], "dblclick", function (event) {
		ge.getFeatures().removeChild(placemark[i]);
		map.removeOverlay(marker[i]);
		STATE_REGISTER[i] = 0;
		//NumberOnScreen -= 1;
		//NumberDead += 1;
		//document.getElementById('enemy').innerHTML = NumberOnScreen;
		AddNewEnemy(i);
		$("#music_gun").jPlayer( {
		ready: function () {
			$(this).stop();
		}
	});
		$("#music_dead").jPlayer( {
		ready: function () {
			$(this).play();
		}
	});
	});
	
    google.earth.addEventListener(placemark[i], "mouseover", function (event) {
		ge.getFeatures().removeChild(placemark[i]);
		map.removeOverlay(marker[i]);
		//NumberOnScreen -= 1;	
		//document.getElementById('enemy').innerHTML = NumberOnScreen;
		STATE_REGISTER[i] = 0;
		AddNewEnemy(i);
		window.focus();
		$("#music_gun").jPlayer( {
		ready: function () {
			$(this).stop();
		}
	});
		$("#music_dead").jPlayer( {
		ready: function () {
			$(this).play();
		}
	});
	});

	ge.getFeatures().appendChild(placemark[i]);
	
}
	
function moveMons(){
	var user = me.getPageIndex() + 1;
	if (level == 1 || level == 2){

		if (level == 2){
			if (Math.random() > 0.4) {
				height_move = height_move + Math.random()*user*user;}
			else{ 
				height_move = height_move - Math.random()*user*user;}
		
			if (height_move > height + 20*user*user) {
				height_move = height + 2;}
			if (height_move < height){
				height_move = height + 5;}
		}
	
		for (var i = 0; i < CURRENT_NUM ; i++){
			lat_indi[MAX_NUM] = 0;
			log_indi[MAX_NUM] = 0;
			DetermineLocation(MAX_NUM,100000,0.3);
			lat_indi[i] += lat_indi[MAX_NUM]*user;
			log_indi[i] += log_indi[MAX_NUM]*user;
			loc[i].setLatLngAlt(lat_indi[i], log_indi[i],height_move);
			point[i].set(lat_indi[i] + lat_shift,log_indi[i] + log_shift,height_move + height_shift,ge.ALTITUDE_RELATIVE_TO_GROUND,false,true);
			marker[i].setLatLng(new GLatLng(lat_indi[i], log_indi[i]));
		}	
	
	}
}

function AddNewEnemy(i){
	
	EnemyCount();
	
	if (NumberOnScreen === 0 && CURRENT_NUM == MAX_NUM){
		UserWin = true;
		WinningCondition(i);
	}
	
	if (NumberOnScreen === 0 && CURRENT_NUM + 1 <= MAX_NUM)	{
		CURRENT_NUM += 1;}
	else if (CURRENT_NUM + 1 <= MAX_NUM){
		var state = Math.random();
		if (state > 0.8){
			if (CURRENT_NUM + 2 <= MAX_NUM)	{
				CURRENT_NUM += 2;}
			else{
				CURRENT_NUM += 1;}
		}
		else if (state > 0.3 && state < 0.8){
			CURRENT_NUM += 1;}
	}
	
	for (; handle < CURRENT_NUM; handle ++){
		DetermineLocation(handle,500,Math.random());
		scale_indi[handle] = ge.createScale('');
		scale_indi[handle].set(scale,scale,scale);
		createModel(handle);
		STATE_REGISTER[handle] = 1;
		//NumberOnScreen += 1;
	}
	
	
	EnemyCount();
	document.getElementById('enemy').innerHTML = NumberOnScreen;
	
	//NumberDead += 1;
	//document.getElementById('enemy').innerHTML = CURRENT_NUM - NumberDead;
	//document.Watch2.watch2.value = 'M:'+ MAX_NUM +' C:'+CURRENT_NUM+'     d:'+NumberDead;
	
}

function DetermineLocation(i,base, prob){
	//Latitude decision
	if (Math.random() > prob) {
		lat_indi[i] += Math.random()/base;}
	else {
		lat_indi[i] -= Math.random()/base;}
		
	if (Math.random() > prob) {
		log_indi[i] += Math.random()/base;}
	else {
		log_indi[i] -= Math.random()/base;}
}


var UserWin = false;
function WinningCondition(i){
	var winplacemark = ge.getView().hitTest(0.5, ge.UNITS_FRACTION, 0.95, ge.UNITS_FRACTION, ge.HIT_TEST_GLOBE);
	var winmark = 10000*time_remaining/total_time;
	
	winplacemark = ge.createPlacemark('');
	
	var winpoint = ge.createPoint('');
	winpoint.set(lat_indi[i],log_indi[i],height,ge.ALTITUDE_RELATIVE_TO_GROUND,false,true);
	winplacemark.setGeometry(winpoint);
	
	ge.getFeatures().appendChild(winplacemark);
	
	var balloon = ge.createHtmlStringBalloon('');
	balloon.setFeature(winplacemark);
	balloon.setMinWidth(400);
	balloon.setMaxWidth(400);
	balloon.setMinHeight(200);
	balloon.setMaxHeight(200);

	balloon.setContentString(
		'<div style="background: #000; width: 400px; height: 195px;">'+
		'	<div style="font-size: 36pt; color: #f06; text-align: center; width: 400px;">'+
		'		<le>*~</le>You Win<ri>~*</ri>'+
		'	</div>'+ 
		'	<div style="position: absolute; color: #fff; font-size: 36pt; top: 45%; left: 17%; width: 50%;">Score</div>'+
		'	<div style="position: absolute; color: #fcf; font-size: 60pt; top: 48%; right: 19%; text-align: right; width: 50%;">'+
			parseInt(winmark) +
		'	</div>'+
		'</div>');

	ge.setBalloon(balloon);
	$("#music_back_ground").jPlayer( {
		ready: function () {
			$(this).stop();
		}
	});
	$("#music_win").jPlayer( {
		ready: function () {
			$(this).play();
		}
	});
}

var LatArray = [37.7933, 35.040675, 50.085734];
var LogArray = [-122.3999, -120.629513, -122.855824];
var UserHeightArray = [2, 30, 120];
var EnemyArray = [ {link_text:'Enemy/Slime.dae',    scale: 1,  height: 0,   lat_shift: 0, log_shift: 0,       height_shift: 5, sound: 'wav/slime.mp3'},
				   {link_text:'Enemy/Target.dae',   scale: 10, height: 25,  lat_shift: -0.00006, log_shift: 0.0001,  height_shift: 12, sound: 'wav/Target.mp3'},
				   {link_text:'Enemy/Chopper2.dae', scale: 1,  height: 100, lat_shift: 0.0001,   log_shift: 0.00005, height_shift: 7, sound: 'wav/chopper.mp3'}
				 ];
var TotalTimeArray = [60, 120, 180];

function EnemyCount(){
	NumberOnScreen = 0;
	//document.Watch2.watch2.value = '';
	
	for (var p = 0; p < MAX_NUM; p++){
		NumberOnScreen += STATE_REGISTER[p];
		//document.Watch2.watch2.value +=  STATE_REGISTER[p];
	}
}

