'use strict';
const Handlebars = require('handlebars');
const url = require('url');
const _ = require('lodash');

module.exports = (imgUrl, width, quality) => {
	width = parseInt(width, 10) || 250;
	quality = Handlebars.escapeExpression(quality) || 'low';
	const parsedImgUrl = url.parse(imgUrl, true);
	if (parsedImgUrl.host !== 'image.webservices.ft.com') {
		return `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(imgUrl)}?source=Alphaville&width=${width}&quality=${quality}`;
	}
	parsedImgUrl.query = _.extend({}, parsedImgUrl.query, {source:'Alphaville', width, quality});
	parsedImgUrl.search = undefined;
	return url.format(parsedImgUrl);
};