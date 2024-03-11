const Log = require("logger");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start() {
        Log.info(`Starting node_helper for module [${this.name}]`);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "GET_PIHOLE") {
            const config = payload.config;

            if (!this.isValidURL(config.apiURL)) {
                Log.error(`${this.name}: The apiURL is not a valid URL`);
                return;
            }

            Log.debug(`Notification: ${notification} Payload: ${payload}`);
            this.getPiholeData(config, { summary: 1 }, "PIHOLE_DATA");

            if (config.showSources && config.sourcesCount > 0) {
                if (config.showSources && !config.apiToken) {
                    Log.error(
                        `${this.name}: Can't load sources because the apiKey is not set.`,
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

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    },

    buildURL(config, params) {
        params = params || {};

        if (config.apiToken && !params.hasOwnProperty("auth")) {
            params.auth = config.apiToken;
        }

        const url = new URL(config.apiURL);

        if (config.port) {
            url.port = config.port;
            Log.warn(
                `${this.name}: config.port is deprecated and will be removed in a later release.`,
            );
        }

        url.search = new URLSearchParams(params).toString();
        return url.toString();
    },

    async getPiholeData(config, params, notification) {
        const self = this,
            url = self.buildURL(config, params),
            headers = { Referer: url };

        this.sendSocketNotification("LOADING_PIHOLE_URL", url);

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                Log.error(`${this.name}: HTTP Error ${response.status}`);
            }
            if (
                response.headers
                    .get("content-type")
                    .includes("application/json")
            ) {
                const data = await response.json();
                self.sendSocketNotification(notification, data);
            } else {
                Log.error(
                    `${
                        this.name
                    }: Expected JSON but received ${response.headers.get(
                        "content-type",
                    )}`,
                );
            }
        } catch (error) {
            Log.error(`${this.name}: ${error}`);
        }
    },
});
