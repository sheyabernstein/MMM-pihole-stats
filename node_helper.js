const Log = require("logger");
const request = require("request");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function () {
        Log.info("Starting node_helper for module [" + this.name + "]");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_PIHOLE") {
            let config = payload.config;

            if (!this.isValidURL(config.apiURL)) {
                Log.error(this.name + ": The apiURL is not a valid URL");
                return;
            }

            Log.info("Notification: " + notification + " Payload: " + payload);
            this.getPiholeData(config, { summary: 1 }, "PIHOLE_DATA");

            if (config.showSources && config.sourcesCount > 0) {
                if (config.showSources && !config.apiToken) {
                    Log.error(
                        this.name +
                            ": Can't load sources because the apiKey is not set.",
                    );
                } else {
                    this.getPiholeData(
                        config,
                        { getQuerySources: config.sourcesCount },
                        "PIHOLE_SOURCES",
                    );
                }
            }
        }
    },

    isValidURL: function (url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    },

    buildURL: function (config, params) {
        params = params || {};

        if (config.apiToken && !params.hasOwnProperty("auth")) {
            params["auth"] = config.apiToken;
        }

        const url = new URL(config.apiURL);

        url.search = new URLSearchParams(params).toString();
        return url.toString();
    },

    getPiholeData: function (config, params, notification) {
        const self = this,
            url = self.buildURL(config, params),
            headers = { Referer: url };

        this.sendSocketNotification("LOADING_PIHOLE_URL", url);

        request({ url, headers, json: true }, (error, response, data) => {
Log.info('url', url)
//Log.info('response', response.statusCode)
//Log.info('data', data)
            if (error) {
                Log.error(self.name + " ERROR:", error);
            } else {
                self.sendSocketNotification(notification, data);
            }
        });
    },
});
