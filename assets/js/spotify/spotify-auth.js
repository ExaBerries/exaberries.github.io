function checkAuth() {
	if (hasParam("access_token")) {
		var accessToken = getParam('access_token');
		$.ajax({
			url: 'https://api.spotify.com/v1/me',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			},
			success: function(response) {
				$("#content").show();
				$("#auth").hide();
				$("#auth-background").html("");
				$("body").removeClass("no-scroll");
				$("footer").show();
				run();
			},
			error: function(xhr, status, error) {
				console.log(xhr);
			}
		});
	}
}

function auth() {
	redirectToSpotifyAuth();
}

function redirectToSpotifyAuth() {
	var clientID = "5f12eddb812a4069bd02d409e8e9714b";
	var redirectURI = $(location).attr('href');
	if (redirectURI.includes("#")) {
		redirectURI = $(location).attr('href').split("#")[0];
	}
	var authURL = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=user-read-private%20user-read-email%20user-library-read&response_type=token&state=123";
	$(location).attr('href', authURL);
}