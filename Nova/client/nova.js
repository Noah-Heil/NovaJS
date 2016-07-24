// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x000000);

// create a renderer instance
var screenW = $(window).width(), screenH = $(window).height() - 10;
var positionConstant = 1;
//var screenW = 800, screenH = 600;
var renderer = PIXI.autoDetectRenderer(screenW, screenH, {
    resolution: window.devicePixelRatio || 1,
    autoResize: true

});

PIXI.RESOLUTION = window.devicePixelRatio;

$(window).resize(onResize);
// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

var socket = io();
document.onkeydown = function(e) {
    e = e || event;
    blocked_keys = [37, 38, 39, 40, 32, 9, 17];

//    socket.emit('test', "Hey look, i'm a test event");
    myShip.updateStats();

    switch (e.keyCode) {
    case 9:
	myShip.cycleTarget();
	break;
    }

    
    var newStats = {};
    newStats[myShip.UUID] = myShip.getStats();
    socket.emit('updateStats', newStats)
    
    if (_.contains(blocked_keys, e.keyCode)) {
	return false;
    }
    else {
	return true;
    }
}
document.onkeyup = function(e) {
    myShip.updateStats();
    var newStats = {};
    newStats[myShip.UUID] = myShip.getStats();
    socket.emit('updateStats', newStats)

}

var p = PubSub;

var UUID;

var sync = new syncTime(socket)




// global system variable; eventually will become a syst (like sol or wolf 359).
// will be given by the server on client entrance to the system;
var sol = new system();



var textures = {}; // global texture object that sprites save and load textures from
//var myShip = new playerShip("Starbridge A")
// var medium_blaster = new outfit("Medium Blaster", 5);
// var medium_blaster_t = new outfit("Medium Blaster Turret", 1);
// var ir_missile = new outfit("IR Missile Launcher", 4);
// var shuttle_missile = new outfit("IR Missile Launcher", 1);
// var shuttle_blaster = new outfit("Medium Blaster Turret", 2);

// var myShip = new playerShip({
//     "name":"Starbridge A",
//     "outfits":{"Medium Blaster Turret":4, "IR Missile Launcher":4}}, system);



//var bar = new statusBar("civilian", myShip);
/*
var starbridge = new ship({"name":"Starbridge A", "outfits": {}}, system);
var shuttle = new ship({"name":"Shuttle A", "outfits":{}}, system);
var dart = new ship({"name":"Vell-os Dart", "outfits":{}}, system);


var earth = new planet({"name":"Earth"}, system);


pp*/

var buildFromInfo = function(buildInfo) {

    var types = {
	ship:ship,
	planet:planet,
	spaceObject:spaceObject
    };


}

var players = {};
var myShip;
var stars;
var stagePosition;

function updateSystem(systemInfo) {
    _.each(systemInfo, function(obj, key) {
	


    });
}

socket.on('onconnected', function(data) {
    UUID = data.id;
    console.log("Connected to server. UUID: "+UUID);

    myShip = new playerShip(data.playerShip, sol);
    stars = new starfield(myShip, 40);
    sol.setObjects(data.system);
    stars.build()
	.then(myShip.build.bind(myShip))
	.then(sol.build.bind(sol))
	.then(function() {
	    console.log("built objects");
	    stagePosition = myShip.position;
	    startGame();
	});
    
    //players[UUID] = myShip;
});

socket.on('disconnect', function() {
    console.log("disconnected");
//    players = {};
    UUID = undefined;
});



socket.on('addObjects', function(buildInfoList) {
    console.log("adding objects ", buildInfoList);
    sol.addObjects(buildInfoList);
    sol.build()
});

socket.on('removeObjects', function(uuids) {
    sol.removeObjects(uuids);
});


socket.on('updateStats', function(stats) {
    //    console.log(stats);
    sol.updateStats(stats);
});

socket.on('test', function(data) {
    console.log(data);
});

//var target = new targetImage("Starbridge.png")
//target.build()

//for collisions

//have ships do this pushing themselves
var ships = [];


var startGameTimer = setInterval(function () {startGame()}, 500);


var readyToRender = false;

//var buildShips = _.map(ships, function(s) {return s.build()})


function startGame() {

    //replace with promises
    $.when( sol.spaceObjects.map(function(s){
	// improve me
	if (! (s instanceof projectile)) {
	    s.show()
	}
    }) ).done(function() {
	stars.placeAll()
	requestAnimationFrame(animate)
	clearInterval(startGameTimer)
	console.log("Rendering started")
    });


}

//requestAnimationFrame(animate)

// the time difference between the server and client clocks
// NOT the ping time.
var timeDifference = 0;
setTimeout(function() {sync.getDifference().then(function(d) {timeDifference = d})}, 2000);
//setInterval(function() {sync.getDifference().then(function(d) {timeDifference = d})},10000);
//var syncClocksTimer = setInterval(function() {sync.getDifference()
//					      .then(function(d) {timeDifference = d})}, 120000);

basicWeapon.prototype.socket = socket;
spaceObject.prototype.socket = socket;
spaceObject.prototype.lastTime = new Date().getTime();
function animate() {
    
    spaceObject.prototype.time = new Date().getTime() + timeDifference;
    
    myShip.render()

    stars.render()
    var lastTimes = []
    _.each(sol.spaceObjects, function(s) {
    	if (s.rendering) {
    	    s.render()
	    lastTimes.push(s.lastTime)
    	}
    });


    //bar.render()
    
//    times = _.map(lastTimes, function(x) {return myShip.lastTime - x});
//    console.log(times)
//    console.log(_.reduce(function(a,b) {return a && b}, times, true))
    
    renderer.render(stage);

    requestAnimationFrame( animate );


}



function onResize() {
    screenW = $(window).width();
    screenH = $(window).height();
    renderer.resize(screenW,screenH);
    //also update the starfield
    stars.resize()
    myShip.statusBar.resize()
}