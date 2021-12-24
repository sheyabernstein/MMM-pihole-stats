const NodeHelper = require("node_helper");
const axios = require('axios');

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

	getPiholeData: async function (url, port, notification) {
		var self = this;

		// Add port to the proper location
		var splitUrl = url.split("/");
		if(url.startsWith("http")) {
			splitUrl[2] = splitUrl[2] + ":" + port;
		}
		else {
			splitUrl[0] = splitUrl[0] + ":" + port;
		}
		url = splitUrl.join("/");

		try {
			console.log(this.name + ": url: " + url);
			var html = await axios.get(url);
			this.sendSocketNotification(notification, html.data);
		}
		catch (e) {
			console.log(this.name + " error: " + e);
            console.error(e);
        }
	}

});
