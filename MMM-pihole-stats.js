/* MagicMirror²
 * Module: Pi-Hole Stats
 *
 * By Sheya Bernstein https://github.com/sheyabernstein/MMM-pihole-stats
 * MIT Licensed.
 */

Module.register("MMM-pihole-stats", {
    // Default module config.
    defaults: {
        apiKey: "",
        apiURL: "http://pi.hole/admin/api.php",
        showSources: true,
        sourcesCount: 10,
        showSourceHostnameOnly: true,

        updateInterval: 10 * 60 * 1000, // every 10 minutes
        animationSpeed: 1000,

        floatingPoints: 2,

        retryDelay: 1000 * 30,
        initialLoadDelay: 0
    },

    formatInt(n) {
        return n.toLocaleString();
    },

    formatFloat(n) {
        if (this.config.floatingPoints) {
            const x = 10 ** this.config.floatingPoints;
            return Math.round(parseFloat(n) * x) / x;
        }
        return n;
    },

    // Define start sequence.
    start() {
        Log.info(`Starting module: ${this.name}`);

        this.domains_being_blocked = null;
        this.dns_queries_today = null;
        this.ads_blocked_today = null;
        this.ads_percentage_today = null;
        this.top_sources = null;

        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);
    },

    // Override dom generator.
    getDom() {
        const wrapper = document.createElement("div");

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING...");
            wrapper.className = "dimmed light";
            return wrapper;
        }

        const header = document.createElement("div");
        header.className = "small bright";
        header.innerHTML = `${this.formatInt(this.ads_blocked_today)}
            ads blocked today. (
            ${this.formatFloat(this.ads_percentage_today)}
            %)`;
        wrapper.appendChild(header);

        if (this.top_sources && Object.keys(this.top_sources).length) {
            const table = document.createElement("table");
            table.className = "xsmall light";
            wrapper.appendChild(table);

            const thead = document.createElement("thead");
            table.appendChild(thead);

            const row = document.createElement("tr");
            thead.appendChild(row);

            const sourceCell = document.createElement("th");
            sourceCell.innerHTML = "Client";
            row.appendChild(sourceCell);

            const countCell = document.createElement("th");
            countCell.innerHTML = "Requests";
            row.appendChild(countCell);

            const tbody = document.createElement("tbody");
            table.appendChild(tbody);

            for (let source in this.top_sources) {
                const adCount = this.top_sources[source];

                if (this.config.showSourceHostnameOnly) {
                    source = source.split("|")[0];
                }

                const row = document.createElement("tr");
                tbody.appendChild(row);

                const sourceCell = document.createElement("td");
                sourceCell.innerHTML = source;
                row.appendChild(sourceCell);

                const countCell = document.createElement("td");
                countCell.innerHTML = this.formatInt(adCount);
                row.appendChild(countCell);
            }
        }

        const footer = document.createElement("div");
        footer.className = "xsmall";
        footer.innerHTML = `${this.formatInt(this.dns_queries_today)}
            DNS queries,
            ${this.formatInt(this.domains_being_blocked)}
            domains blacklisted.`;
        wrapper.appendChild(footer);

        return wrapper;
    },

    updateStats() {
        Log.info(`${this.name}: Getting data`);

        this.sendSocketNotification("GET_PIHOLE", {
            config: this.config
        });
    },

    // Handle node helper response
    socketNotificationReceived(notification, payload) {
        if (notification === "PIHOLE_DATA") {
            this.processSummary(payload);
            this.loaded = true;
        } else if (notification === "PIHOLE_SOURCES") {
            this.processSources(payload);
        }

        this.updateDom(this.config.animationSpeed);
    },

    scheduleUpdate(delay) {
        let nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        const self = this;
        setTimeout(() => {
            self.updateStats();
            self.scheduleUpdate(self.config.updateInterval);
        }, nextLoad);
    },

    processSummary(data) {
        if (!data) {
            // Did not receive usable new data.
            return;
        }

        this.domains_being_blocked = data.domains_being_blocked || "0";
        this.dns_queries_today = data.dns_queries_today || "0";
        this.ads_blocked_today = data.ads_blocked_today || "0";
        this.ads_percentage_today = data.ads_percentage_today || "0.0";
    },

    processSources(data) {
        if (!data) {
            // Did not receive usable new data.
            return;
        }

        this.top_sources = data.top_sources || [];
    }
});
