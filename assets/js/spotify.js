var chart = {};
var stats = {
	trackData: {},
	count: 0,
	minYear: 2100,
	maxYear: 0
};

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
				run();
			}
		});
	}
}

function auth() {
	redirectToSpotifyAuth();
}

function run() {
	if (hasParam("access_token")) {
		var accessToken = getParam('access_token');
		console.log("accessToken=" + accessToken);
		getInfo(accessToken);
	} else {
		console.log("no access token");
		redirectToSpotifyAuth();
	}
}

function getInfo(accessToken) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			console.log(response);
			$("#username").text(response.display_name);
			var usrID = response.id;
			processLibrary(accessToken, 0);
			processPlaylists(accessToken, usrID);
		},
		error: function(xhr, status, error) {
			redirectToSpotifyAuth();
		}
	});
}

function processLibrary(accessToken, numSearched) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me/tracks?limit=20&offset=' + numSearched,
		headers: {
			'Authorization': 'Bearer ' + accessToken,
		},
		success: function(response) {
			for (var i = 0; i < response.items.length; i++) {
				processTrack(accessToken, response.items[i].track);
				numSearched++;
			}
			renderSongChart(stats);
			if (numSearched < response.total) {
				processLibrary(accessToken, numSearched);
			}
		}
	});
}

function processPlaylists(accessToken, usrID) {
	$.ajax({
		url: 'https://api.spotify.com/v1/users/' + usrID + '/playlists',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			for (var i = 0; i < response.items.length; i++) {
				var playlistID = response.items[i].id;
				processPlaylistTracks(accessToken, playlistID, 0);
			}
		}
	});
}

function processPlaylistTracks(accessToken, playlistID, numSearched) {
	$.ajax({
		url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			for (var i = 0; i < response.items.length; i++) {
				processTrack(accessToken, response.items[i].track);
				numSearched++;
			}
			renderSongChart(stats);
			if (numSearched < response.total) {
				processPlaylistTracks(accessToken, playlistID, numSearched);
			}
		}
	});
}

function processTrack(accessToken, track) {
	if (!(track.name in stats.trackData)) {
		var year = parseInt(track.album.release_date.substring(0, 4), 10);
		stats.trackData[track.name] = {
			name: track.name,
			year: year,
			duration: track.duration_ms
		};
		if (year < stats.minYear) {
			stats.minYear = year;
		} else if (year > stats.maxYear) {
			stats.maxYear = year;
		}
		stats.count++;
	}
}

function redirectToSpotifyAuth() {
	var clientID = "5f12eddb812a4069bd02d409e8e9714b";
	var redirectURI = $(location).attr('href');
	var authURL = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=user-read-private%20user-read-email%20user-library-read&response_type=token&state=123";
	$(location).attr('href', authURL);
}

function createSongChart() {
	var ctx = $("#songsperyear");
	chart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: [{
				label: 'Songs',
				data: [],
				backgroundColor: [],
				borderColor: [],
				borderWidth: 1
			}]
		},
		options: {
			onClick: function(event) {
				var activeElement = chart.getElementAtEvent(event);
				if (activeElement.length > 0) {
					listSongs(activeElement[0]._model.label);
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
}

function renderSongChart(stats) {
	console.log("render");
	var chartLabels = [];
	var chartData = [];
	var chartBackgroundColors = [];
	var chartBorderColors = [];
	for (var i = 0; i < stats.maxYear - stats.minYear; i++) {
		chartLabels[i] = stats.minYear + i;
		chartBackgroundColors[i] = 'rgba(75, 192, 192, 0.2)';
		chartBorderColors[i] = 'rgba(75, 192, 192, 1)';
		chartData[i] = 0;
	}
	for (var key in stats.trackData) {
		chartData[stats.trackData[key].year - stats.minYear]++;
	}
	chart.data.labels = chartLabels;
	chart.data.datasets[0].data = chartData;
	chart.data.datasets[0].backgroundColor = chartBorderColors;
	chart.data.datasets[0].borderColor = chartBackgroundColors;
	chart.update();
}

function listSongs(year) {
	var str = "";
	for (var key in stats.trackData) {
		if (stats.trackData[key].year == year) {
			str += stats.trackData[key].name + " ";
		}
	}
	$("#songslist").text(str);
}
