function linkSwitcher(link) {
	var extIDc = "emhohdghchmjepmigjojkehidlielknj";
	var extIDo = "simpleundoclose";
	
	var chr = "https://chrome.google.com/webstore/support/"+extIDc;
	var opr = "https://addons.opera.com/";
	var locale = window.navigator.language;
	var vendor = window.navigator.vendor;
	var linkRef = link.href;
	
	if (vendor === "Google Inc.") {
		link.href = chr + "?hl=" + locale;
	}
	if (vendor === "Opera Software ASA") {
		if (locale.substr(0, 2) == "en")
			locale = "en";
		link.href = opr + locale.toLowerCase() + "/extensions/details/" + extIDo +"/?display="+ locale.toLowerCase() +"&reports#feedback-container";
	}
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('feedbkLnk').innerHTML = chrome.i18n.getMessage("feed_text2");
	linkSwitcher(document.getElementById('feedbkLnk'));
});