const Log = require("logger");
const NodeHelper = require("node_helper");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const https = require("https"); // For HTTPS agent

module.exports = NodeHelper.create({
    // Store the session ID (SID) from authentication
    sid: null,

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

            Log.debug(
                `Notification: ${notification} Payload: ${JSON.stringify(payload)}`,
            );

            if (config.apiKey && !this.sid) {
                this.authenticate(config).then(() => {
                    this.requestData(config);
                });
            } else {
                this.requestData(config);
            }
        }
    },

    // Separate function to make the requests (for both summary and top clients)
    requestData(config) {
        // Get summary data using the /stats/summary endpoint.
        this.getPiholeData(config, { summary: 1 }, "PIHOLE_DATA");

        // Get top clients (sources) if enabled using the /stats/top_clients endpoint.
        if (config.showSources && config.sourcesCount > 0) {
            if (!config.apiKey) {
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
    },

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    },

    // Build a URL from the base apiURL and query parameters.
    // For summary: use "/stats/summary"
    // For query sources: use "/stats/top_clients" with a count parameter.
    buildURL(config, params) {
        params = params || {};
        let url = new URL(config.apiURL);
        if (params.summary !== undefined) {
            delete params.summary;
            url.pathname = url.pathname.replace(/\/?$/, "/stats/summary");
            url.search = new URLSearchParams(params).toString();
        } else if (params.getQuerySources !== undefined) {
            delete params.getQuerySources;
            url.pathname = url.pathname.replace(/\/?$/, "/stats/top_clients");
            url.search = new URLSearchParams({
                count: config.sourcesCount,
            }).toString();
        } else {
            url.search = new URLSearchParams(params).toString();
        }
        return url.toString();
    },

    // Helper: returns fetch options, including an HTTPS agent if necessary.
    getFetchOptions(urlStr, extraOptions = {}) {
        const urlObj = new URL(urlStr);
        const options = { ...extraOptions };
        if (urlObj.protocol === "https:") {
            options.agent = new https.Agent({ rejectUnauthorized: false });
        }
        return options;
    },

    // Authenticate with Pi-hole v6 and store the returned session ID (SID)
    async authenticate(config) {
        let authURL;
        try {
            const baseURL = new URL(config.apiURL);
            const basePath = baseURL.pathname.replace(/\/$/, ""); // Remove trailing slash if any
            authURL = `${baseURL.origin}${basePath}/auth`;
        } catch (e) {
            Log.error(`${this.name}: Error constructing auth URL: ${e}`);
            return;
        }

        try {
            const options = this.getFetchOptions(authURL, {
                method: "POST",
                body: JSON.stringify({ password: config.apiKey }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await fetch(authURL, options);
            if (!response.ok) {
                throw new Error(
                    "Authentication failed with status " + response.status,
                );
            }
            const data = await response.json();
            this.sid = data.session.sid;
            Log.info(`${this.name}: Authenticated successfully. SID obtained.`);
        } catch (error) {
            Log.error(`${this.name}: Error during authentication: ${error}`);
        }
    },

    // Retrieve data from Pi-hole using the new API and include the SID header.
    // If a 401 Unauthorized error occurs, reauthenticate and retry once.
    async getPiholeData(config, params, notification) {
        const url = this.buildURL(config, params);
        const headers = { Referer: url };
        if (this.sid) {
            headers.sid = this.sid;
        }
        this.sendSocketNotification("LOADING_PIHOLE_URL", url);

        try {
            let options = this.getFetchOptions(url, { headers });
            let response = await fetch(url, options);

            // If unauthorized, attempt to reauthenticate and retry once.
            if (response.status === 401) {
                Log.warn(
                    `${this.name}: Received 401 Unauthorized. Reauthenticating...`,
                );
                await this.authenticate(config);
                headers.sid = this.sid; // Update header with new SID.
                options = this.getFetchOptions(url, { headers });
                response = await fetch(url, options);
            }

            if (!response.ok) {
                Log.error(`${this.name}: HTTP Error ${response.status}`);
            }

            if (
                response.headers
                    .get("content-type")
                    ?.includes("application/json")
            ) {
                const data = await response.json();
                this.sendSocketNotification(notification, data);
            } else {
                Log.error(
                    `${this.name}: Expected JSON but received ${response.headers.get("content-type")}`,
                );
            }
        } catch (error) {
            Log.error(`${this.name}: ${error}`);
        }
    },
});
