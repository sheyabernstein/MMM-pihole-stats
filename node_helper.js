
var request = require('request');
var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	start: function () {
		console.log("Starting node_helper for module [" + this.name + "]");
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "GET_PIHOLE") {
			var config = payload.config;
			if (config.showSources && (config.apiToken == null || config.apiToken == "")) {
				console.error( this.name + ": No apiKey set." );
			}
			else {
				console.log("Notification: " + notification + " Payload: " + payload);

				this.getPiholeData(config.apiURL + '?summary', config.port, 'PIHOLE_DATA');
				if (config.showSources && config.sourcesCount > 0) {
					this.getPiholeData(config.apiURL + '?getQuerySources=' + config.sourcesCount + '&auth=' + config.apiToken, config.port, 'PIHOLE_SOURCES');
				}
			}
		}
	},

	getPiholeData: function (url, port, notification) {
		var self = this;
		request({ url: url, port: port, headers: { 'Referer': url }, method: 'GET' }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification(notification, JSON.parse(body));
			} else {
				console.error(self.name + ' ERROR:', error);
				console.error(self.name + ' statusCode:', response.statusCode);
				console.error(self.name + ' body:', body);
			}
		});
	}

});
