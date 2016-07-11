function playerShip(shipName, outfits) {
    ship.call(this, shipName, outfits);
    this.pointing = Math.random()*2*Math.PI;
    this.velocity[0] = 0;
    this.velocity[1] = 0;
    this.isPlayerShip = true;
    this.weapons.primary = [];
    this.weapons.secondary = [];
}

playerShip.prototype = new ship

playerShip.prototype.build = function() {
    ship.prototype.build.call(this)

	.then(function() {
	    this.sortWeapons()

	}.bind(this));
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

playerShip.prototype.addToSpaceObjects = function() {
    spaceObjects.unshift(this);
}

playerShip.prototype.updateStats = function() {
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

    
    ship.prototype.updateStats.call(this, turning, accelerating);

}