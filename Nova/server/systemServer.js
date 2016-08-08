module.exports = systemServer
var system = require("../client/system.js");
var _ = require("underscore");

function systemServer() {
    system.call(this);

}
systemServer.prototype = new system;
systemServer.prototype.resume = function() {
    var time = new Date().getTime();
    _.each(this.spaceObjects, function(s) {
	s.lastTime = time
    }.bind(this));
}
    
systemServer.prototype.getMissingObjects = function() {};
    
