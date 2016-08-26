require('./common');
require('o-comments');
require('o-comment-count');
require('o-video');
require('o-share');

const oAds = require('alphaville-ui')['o-ads'];

const embeddedMedia = require('webchat/src/js/ui/embeddedMedia');

document.addEventListener('o.DOMContentLoaded', function () {
	const closedContentContainer = document.querySelector('.webchat-closed-content');

	if (closedContentContainer) {
		embeddedMedia.convert(closedContentContainer);
	}

	const inArticleAd = document.querySelector('.alphaville-in-article-ad');
	const isMlTranscript = !!document.querySelector('.webchat-closed-content');

	let linesNumber;

	if (isMlTranscript) {
		linesNumber = document.querySelectorAll('.webchat-closed-content > div.msg');

		if (linesNumber.length > 0) {
			if (linesNumber.length > 3) {
				const fourthLine = linesNumber[3];
				fourthLine.parentNode.insertBefore(inArticleAd, fourthLine);
			} else {
				const lastLine = linesNumber[linesNumber.length - 1];
				lastLine.parentNode.insertBefore(inArticleAd, lastLine.nextSibling);
			}
		}
	} else {
		linesNumber = document.querySelectorAll('.article__body > p');

		if (linesNumber.length > 0) {
			if (linesNumber.length > 2) {
				const thirdLine = linesNumber[2];
				thirdLine.parentNode.insertBefore(inArticleAd, thirdLine.nextSibling);
			} else {
				const lastLine = linesNumber[linesNumber.length - 1];
				lastLine.parentNode.insertBefore(inArticleAd, lastLine.nextSibling);
			}
		}
	}

	oAds.init(inArticleAd);
});

require('o-autoinit');
