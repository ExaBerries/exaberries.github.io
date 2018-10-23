var stats = {
	trackData: [],
	albumData: [],
	count: 0,
	minYear: 2100,
	maxYear: 0
};
var currentTrackID = 0;
var currentAlbumID = 0;

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
			createFilterButton("Library");
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
				processTrack(accessToken, response.items[i].track, "Library");
				numSearched++;
			}
			renderSongChart();
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
				processPlaylistTracks(accessToken, playlistID, 0, response.items[i].name);
				createFilterButton(response.items[i].name);
			}
		}
	});
}

function processPlaylistTracks(accessToken, playlistID, numSearched, name) {
	$.ajax({
		url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			for (var i = 0; i < response.items.length; i++) {
				processTrack(accessToken, response.items[i].track, name);
				numSearched++;
			}
			renderSongChart();
			if (numSearched < response.total) {
				processPlaylistTracks(accessToken, playlistID, numSearched, name);
			}
		}
	});
}

function processTrack(accessToken, track, source) {
	var year = parseInt(track.album.release_date.substring(0, 4), 10);
	var artists = [];
	for (var i = 0; i < track.artists.length; i++) {
		artists.push(track.artists[i].name);
	}
	var containsAlbum = (typeof(getAlbumData(track.album.name, track.artists[0].name)) != "undefined");
	if (!containsAlbum) {
		stats.albumData[currentAlbumID++] = {
			name: track.album.name,
			year: year,
			imgURL: track.album.images[1].url,
			artists: artists,
			sources: [source],
			songs: [currentTrackID]
		};
	} else {
		getAlbumData(track.album.name, track.artists[0].name).sources.push(source);
	}
	var containsTrack = (typeof(getTrackData(track.name, track.album.name, track.artists[0].name)) != "undefined");
	if (!containsTrack) {
		stats.trackData[currentTrackID++] = {
			name: track.name,
			year: year,
			duration: track.duration_ms,
			artists: artists,
			sources: [source]
		};
		if (year < stats.minYear) {
			stats.minYear = year;
		} else if (year > stats.maxYear) {
			stats.maxYear = year;
		}
		var albumData = getAlbumData(track.album.name, track.artists[0].name);
		if ($.inArray(currentTrackID - 1, albumData.songs) == -1) {
			albumData.songs.push(currentTrackID - 1);
		}
		stats.count++;
	} else {
		getTrackData(track.name, track.album.name, track.artists[0].name).sources.push(source);
	}
}

function getTrackData(name, album, artist) {
	for (var i = 0; i < stats.trackData.length; i++) {
		for (var j = 0; j < stats.albumData.length; j++) {
			if (stats.trackData[i].name == name && stats.albumData[j].name == album && $.inArray(artist, stats.trackData[i].artists) != -1 && $.inArray(artist, stats.albumData[j].artists) != -1) {
				return stats.trackData[i];
			}
		}
	}
	return undefined;
}

function getAlbumData(name, artist) {
	for (var i = 0; i < stats.albumData.length; i++) {
		if (stats.albumData[i].name == name && $.inArray(artist, stats.albumData[i].artists) != -1) {
			return stats.albumData[i];
		}
	}
	return undefined;
}