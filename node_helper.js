const Log = require("logger");
const fetch = require("node-fetch");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	start: function () {
		Log.info("Starting node_helper for module [" + this.name + "]");
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "GET_PIHOLE") {
			let config = payload.config;
			if (config.showSources && (config.apiToken == null || config.apiToken == "")) {
				Log.error( this.name + ": No apiKey set." );
			}
			else {
				Log.info("Notification: " + notification + " Payload: " + payload);

				this.getPiholeData(config.apiURL + '?summary&auth=' + config.apiToken, config.port, 'PIHOLE_DATA');
				if (config.showSources && config.sourcesCount > 0) {
					this.getPiholeData(config.apiURL + '?getQuerySources=' + config.sourcesCount, config.port, 'PIHOLE_SOURCES');
				}
			}
		}
	},

	getPiholeData: function (url, port, notification) {
		const self = this;

		url = new URL(url);
		url.port = port;
		url = url.toString();
		const headers = {'Referer': url}

		fetch(url, { headers: headers}).then(response => {
			response.json().then(data => {
				self.sendSocketNotification(notification, data);
			})
		}, error => {
			Log.error(self.name + ' ERROR:', error);
		})
	}
});
