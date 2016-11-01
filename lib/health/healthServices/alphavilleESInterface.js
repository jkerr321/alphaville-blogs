'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'alphaville-es-interface',
	name: 'Alphaville Elastic Search interface',
	ok: false,
	technicalSummary: "Alphaville ES interface is used to fetch any content.",
	severity: 1,
	businessImpact: "The application will be down, no content will be served.",
	checkOutput: "",
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`https://${process.env['AV_ELASTIC_SEARCH_URL']}/v1/article/4bc7c806-ef50-3c30-9142-d33f411274fd`)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					const error = new Error(res.statusText);
					error.response = res;
					throw error;
				}
			})
			.then(() => {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			})
			.catch((err) => {
				currentHealth.ok = false;
				currentHealth.checkOutput = "Alphaville ES interface service is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};