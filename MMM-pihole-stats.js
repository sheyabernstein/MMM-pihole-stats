/* Magic Mirror
 * Module: Pi-Hole Stats
 *
 * By Sheya Bernstein https://github.com/sheyabernstein/MMM-pihole-stats
 * MIT Licensed.
 */

Module.register("MMM-pihole-stats", {

	// Default module config.
	defaults: {
		apiURL: "http://pi-hole/admin/api.php",
		showSources: true,

		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,

		retryDelay: 2500,
		initialLoadDelay: 0,
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the defaut modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionairy.
		// If you're trying to build yiur own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.domains_being_blocked = null;
		this.dns_queries_today = null;
		this.ads_blocked_today = null;
		this.ads_percentage_today = null;
		this.top_sources = null;

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light";
			return wrapper;
		}

		var header = document.createElement("div")
		header.className = "small light";
		header.innerHTML = this.ads_blocked_today + ' ads blocked today. (' + this.ads_percentage_today + '%)'
		wrapper.appendChild(header);

		if (this.config.showSources) {
			var table = document.createElement("table");
			table.className = "small";
			wrapper.appendChild(table);

			var thead = document.createElement("thead");
			table.appendChild(thead);

			var row = document.createElement("tr");
			thead.appendChild(row);

			var sourceCell = document.createElement("th");
			sourceCell.innerHTML = 'Client';
			row.appendChild(sourceCell);

			var countCell = document.createElement("th");
			countCell.innerHTML = 'Requests';
			row.appendChild(countCell);

			var tbody = document.createElement("tbody");
			table.appendChild(tbody);

			for (var source in this.top_sources) {
				var adCount = this.top_sources[source];

				var row = document.createElement("tr");
				tbody.appendChild(row);

				var sourceCell = document.createElement("td");
				sourceCell.innerHTML = source;
				row.appendChild(sourceCell);

				var countCell = document.createElement("td");
				countCell.innerHTML = adCount;
				row.appendChild(countCell);
			}
		}

		return wrapper;
	},

	updateSummary: function() {
		var url = this.config.apiURL + '?summary';
		var self = this;
		var retry = true;

		var statsSummaryRequest = new XMLHttpRequest();
		statsSummaryRequest.open("GET", url, true);
		statsSummaryRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processSummary(JSON.parse(this.response));
				} else {
					Log.error(self.name + ": Could not load pi-hole summary.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		statsSummaryRequest.send();
	},

	updateSources: function() {
		var url = this.config.apiURL + '?getQuerySources';
		var self = this;
		var retry = true;

		var statsSourcesRequest = new XMLHttpRequest();
		statsSourcesRequest.open("GET", url, true);
		statsSourcesRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processSources(JSON.parse(this.response));
				} else {
					Log.error(self.name + ": Could not load pi-hole sources.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		statsSourcesRequest.send();
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this
		setTimeout(function() {
			self.updateSummary();
		}, nextLoad);
	},

	processSummary: function(data) {

		if (!data) {
			// Did not receive usable new data.
			return;
		}

		this.domains_being_blocked = data.domains_being_blocked;
		this.dns_queries_today = data.dns_queries_today;
		this.ads_blocked_today = data.ads_blocked_today;
		this.ads_percentage_today = data.ads_percentage_today;

		if (this.config.showSources) {
			this.updateSources();
		}
		else {
			this.loaded = true;
			this.updateDom(this.config.animationSpeed);
		}
	},

	processSources: function(data) {
		if (!data) {
			// Did not receive usable new data.
			return;
		}

		this.top_sources = data.top_sources;

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

})