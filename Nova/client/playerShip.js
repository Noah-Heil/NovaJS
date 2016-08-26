if (typeof(module) !== 'undefined') {
    module.exports = playerShip;
    ship = require("./ship.js");
}


function playerShip(buildInfo, system) {
    ship.call(this, buildInfo, system);
    this.pointing = Math.random()*2*Math.PI;
    this.velocity[0] = 0;
    this.velocity[1] = 0;
    this.isPlayerShip = true;
    this.weapons.primary = [];
    this.weapons.secondary = [];
    this.target = undefined;
    this.targetIndex = -1;

}

playerShip.prototype = new ship;

playerShip.prototype.build = function() {

    return ship.prototype.build.call(this)
	.then(this.sortWeapons.bind(this))
	.then(this.makeStatusBar.bind(this))
    
}


playerShip.prototype.sortWeapons = function() {

    _.each(this.weapons.all, function(weapon) {

	if (weapon.meta.properties.type === "primary") {
	    this.weapons.primary.push(weapon);
	    
	}
	else if (weapon.meta.properties.type === "secondary") {
	    this.weapons.secondary.push(weapon);
	    
	}

    }.bind(this));
    
}

playerShip.prototype.receiveCollision = function(other) {
    ship.prototype.receiveCollision.call(this, other);
    this.sendCollisionToServer();
}

playerShip.prototype.sendCollisionToServer = _.throttle(function() {
    if (typeof this.UUID !== 'undefined') {
	var stats = {};
	stats[this.UUID] = this.getStats();
    }
    this.socket.emit('updateStats', stats);
    
}, 1000);

playerShip.prototype.makeStatusBar = function() {
    this.statusBar = new statusBar('civilian', this);
    return this.statusBar.build()
}



playerShip.prototype.addToSpaceObjects = function() {
    this.system.built.spaceObjects.unshift(this);
    if (this.buildInfo.multiplayer) {
	this.system.built.multiplayer[this.buildInfo.UUID] = this;
    }

}

playerShip.prototype.addSpritesToContainer = function() {
    _.each(_.map(_.values(this.sprites), function(s) {return s.sprite;}),
	   function(s) {this.spriteContainer.addChild(s);}, this);
    this.hide()

    stage.addChildAt(this.spriteContainer, stage.children.length) //playerShip is above all
}

playerShip.prototype.updateStats = function(stats = {}) {
    var keys = KeyboardJS.activeKeys();
    var turning;
    var accelerating;
    if (_.contains(keys, 'right') && !_.contains(keys, 'left')) {
	turning = 'right';
    }
    else if (_.contains(keys, 'left') && !_.contains(keys, 'right')) {
	turning = 'left';
    }
    else {
	turning = '';
    }
    if (_.contains(keys, 'down')) {
	accelerating = -1;
    }
    else if (_.contains(keys, 'up')) {
	accelerating = 1;
    }
    else {
	accelerating = 0;
    }
    if (_.contains(keys, 'space')) {
	_.map(this.weapons.primary, function(weapon) {weapon.startFiring();});

    }
    else {
	_.map(this.weapons.primary, function(weapon) {weapon.stopFiring();});
    }
    if (_.contains(keys, 'a')) {
	this.turningToTarget = true;
    }
    else {
	this.turningToTarget = false;
    }
    if (_.contains(keys, 'ctrl')) {
	_.map(this.weapons.secondary, function(weapon) {weapon.startFiring();});

    }
    else {
	_.map(this.weapons.secondary, function(weapon) {weapon.stopFiring();});
    }
    if (_.contains(keys, 'r')) {
	this.targetNearest();
    }

    stats.turning = turning;
    stats.accelerating = accelerating;

    ship.prototype.updateStats.call(this, stats);
    
}


playerShip.prototype.render = function() {
    // -194 for the sidebar
    this.spriteContainer.position.x = (screenW-194)/2;
    this.spriteContainer.position.y = screenH/2;


    ship.prototype.render.call(this);
    this.statusBar.render();

}

playerShip.prototype.targetNearest = function() {
    var targets = [];
    this.system.ships.forEach(function(s) {
	if (s !== this) {
	    targets.push(s);
	}
    }.bind(this));


    var get_distance = function(a, b) {
	return (a.position[0] - b.position[0])**2 + (a.position[1] - b.position[1])**2;
    }
    
    var distances = {};
    targets.forEach(function(t) {
	var dist = get_distance(t, this);
	distances[dist] = t;
    }.bind(this));

    var min = Math.min(...Object.keys(distances));
    if (min !== Infinity) {
	var t = distances[min];
	if (t !== this.target) {
	    this.targetIndex = this.system.ships.indexOf(t);
	    this.setTarget(t);
	}
    }

}

playerShip.prototype.setTarget = function(target) {
    this.target = target;
    this.statusBar.setTarget(this.target)
    ship.prototype.setTarget.call(this, this.target);
    
}

playerShip.prototype.cycleTarget = function() {
    // targetIndex goes from -1 (for no target) to ships.length - 1
    var incrementTargetIndex = function() {
	this.targetIndex = (this.targetIndex + 2) % (this.system.ships.length + 1) - 1;
	// super cheapo temporary way to not target the player ship (ship 0)
	if (this.targetIndex === 0) {
	    this.targetIndex = (this.targetIndex + 2) % (this.system.ships.length + 1) - 1;
	}
    }.bind(this);

    incrementTargetIndex();

    // If targetIndex === -1, then target is undefined, which is intentional
    this.setTarget(this.system.ships[this.targetIndex]);
//    console.log(this.targetIndex)

    
}


playerShip.prototype.addToSystem = function() {};

playerShip.prototype.onDeath = function() {
    // temporary respawn
    this.position[0] = 0;
    this.position[1] = 0;
    this.shield = this.properties.maxShields;
    this.armor = this.properties.maxArmor;
}
