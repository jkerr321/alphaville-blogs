'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	const searchString = req.query.q;

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	if (!searchString) {
		res.render('search', {
			title: `FT Alphaville | Search`,
			message: 'Please enter a search term',
			isSearch: true
		});
		return;
	}

	articleService.getArticles({
		q: searchString,
		limit: itemsPerPage,
		offset: (page === 1 ? 0 : (page - 1) * itemsPerPage)
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.total / itemsPerPage);

		results.items.forEach((article, index) => {
			if (index === 4) {
				article.adAfter = 1;
			}

			if (index === 10) {
				article.adAfter = 2;
			}
		});

		cacheHeaders.setCache(res, 30);

		res.render('search', {
			title: `FT Alphaville | Search: ${searchString}`,
			searchTerm: searchString,
			searchResults: results.items,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			},
			pagination: results.items.length ? pagination.getRenderConfig(page, totalPages, req) : false,
			isSearch: true
		});
	}).catch(next);
};
