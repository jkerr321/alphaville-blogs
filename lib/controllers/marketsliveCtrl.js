'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const cacheHeaders = require('../utils/cacheHeaders');
const { paginateArticles } = require('../utils/marketsLiveArticles');
const fs = require('fs');
const path = require('path');

const itemsPerPage = 20;

exports.index = function(req, res, next) {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	paginateArticles({
		limit: itemsPerPage,
		offset: (page - 1) * itemsPerPage
	})
		.then(articles => {
			const transcripts = articleService.groupByTime({
				items: articles.paginatedArticles
			});

			let index = 0;
			transcripts.items.forEach(category => {
				if (category && category.items) {
					category.items.forEach(article => {
						if (index === 4) {
							article.adAfter = 1;
						}

						if (index === 10) {
							article.adAfter = 2;
						}

						index++;
					});
				}
			});

			const totalPages = Math.ceil(articles.total / itemsPerPage);

			res.render('ml-index', {
				title: 'Marketslive index | FT Alphaville',
				transcripts: transcripts.items,
				pagination: pagination.getRenderConfig(
					page,
					totalPages,
					req
				),
				navSelected: 'Markets Live',
				adZone: 'markets.live'
			});
		})
		.catch(next);

	cacheHeaders.setCache(res, 300);
};

exports.about = function(req, res) {
	cacheHeaders.setCache(res, 300);

	res.render('ml-about', {
		title: 'About Markets Live | FT Alphaville',
		navSelected: 'About Markets Live',
		adZone: 'markets.live'
	});
};

exports.byUuid = function(req, res, next) {
	return articleService
		.getArticle(`/marketslive/${req.params[0]}`)
		.then(article => {
			if (article.found !== true) {
				next();
				return;
			}

			cacheHeaders.setNoCache(res);

			if (article.isMarketsLive === true) {
				res.redirect(301, article.av2WebUrl);
			} else {
				next();
			}
		});
};

exports.byVanity = function(req, res, next) {
	const content = path.join(__dirname, '../../content/markets-live/', `${req.params.date}.json`);

	if (!fs.existsSync(content)) {
		cacheHeaders.setNoCache(res);
		return next();
	}

	fs.readFile(content, { encoding: 'utf-8' }, (err, data) => {
		if (err) {
			throw err;
		}

		const article = JSON.parse(data);

		function getAnnotations(type) {
			let results = article.annotations.filter(
				item =>
					item.type === type &&
					item.predicate ===
						'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy'
			);
			if (!results.length) {
				results = article.annotations.filter(
					item =>
						item.type === type &&
						item.predicate ===
							'http://www.ft.com/ontology/classification/isClassifiedBy'
				);
			}

			return results;
		}

		if (article.isMarketsLive === true) {
			if (article.isLive === true) {
				cacheHeaders.setNoCache(res);

				const renderData = {
					title: article.originalTitle,
					article: {},
					articleId: article.id,
					apiUrl: `${process.env.WP_URL}/marketslive/${req
						.params[0]}`,
					articleUrl: `${process.env.APP_URL}/marketslive/${req
						.params[0]}`,
					navSelected: 'Markets Live',
					adZone: 'markets.live',
					hideFooter: true,
					hideTopAd: true
				};

				if (article.comments.enabled !== false) {
					res.render('ml-live', renderData);
				} else {
					res.render('ml-live_without_comments', renderData);
				}
			} else {
				cacheHeaders.setCache(res, 300);

				if (req.query.ajax) {
					res.render('ml-transcript-body', {
						article: article,
						layout: false
					});
				} else {
					res.render('ml-transcript', {
						title: article.originalTitle + ' | FT Alphaville',
						article: article,
						articleId: article.id,
						primaryTheme:
							getAnnotations('SECTION').length > 0
								? getAnnotations('SECTION')[0].prefLabel
								: getAnnotations('TOPIC')[0].prefLabel,
						brand: getAnnotations('BRAND')[0].prefLabel,
						hideCommentCount: true,
						navSelected: 'Markets Live',
						adZone: 'markets.live'
					});
				}
			}
		} else {
			cacheHeaders.setNoCache(res);
			next();
		}
	});
};
