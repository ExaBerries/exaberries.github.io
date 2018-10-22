function hasParam(param) {
	var pageURL = $(location).attr('href');
	if (!pageURL.includes("#")) {
		return false;
	}
	var URLVariables = pageURL.split("#")[1].split('&');
	for (var i = 0; i < URLVariables.length; i++) {
		var parameterName = URLVariables[i].split('=');
		if (parameterName[0] == param) {
			return true;
		}
	}
	return false;
}

function getParam(param) {
	var pageURL = $(location).attr('href').split("#")[1];
	var URLVariables = pageURL.split('&');
	for (var i = 0; i < URLVariables.length; i++) {
		var parameterName = URLVariables[i].split('=');
		if (parameterName[0] == param) {
			return parameterName[1];
		}
	}
}
