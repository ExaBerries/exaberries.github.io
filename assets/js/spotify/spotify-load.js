var stats = {
	trackData: [],
	albumData: [],
	artistData: [],
	minYear: 2112,
	maxYear: 0,
	songCount: 0,
	albumCount: 0,
	artistCount: 0
};
var filteredStats = new FilteredStats();
var songFilters = [];
var currentTrackID = 0;
var currentAlbumID = 0;
var currentArtistID = 0;

function FilteredStats() {
	this.songs = [];
	this.albums = [];
	this.artists = [];
	this.minYear = 2112;
	this.maxYear = 0;
	this.numSongs = 0;
	this.numAlbums = 0;
	this.numArtists = 0;
}

var normalizeVersion = true;

function getInfo(accessToken) {
	var normalizeVersionParam = getParam("normalizeVersion");
	if (normalizeVersionParam != undefined) {
		normalizeVersion = normalizeVersionParam;
	}
	console.log("normalizeVersion=" + normalizeVersion);
	$.ajax({
		url: 'https://api.spotify.com/v1/me',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
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
			refilter();
			render();
			if (numSearched < response.total) {
				processLibrary(accessToken, numSearched);
			}
		}
	});
}

function processPlaylists(accessToken, usrID) {
	$.ajax({
		url: 'https://api.spotify.com/v1/me/playlists',
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

function processPlaylistTracks(accessToken, playlistID, numSearched, source) {
	$.ajax({
		url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		success: function(response) {
			for (var i = 0; i < response.items.length; i++) {
				processTrack(accessToken, response.items[i].track, source);
				numSearched++;
			}
			refilter();
			render();
			if (numSearched < response.total) {
				processPlaylistTracks(accessToken, playlistID, numSearched, source);
			}
		}
	});
}

function processTrack(accessToken, track, source) {
	var year = parseInt(track.album.release_date.substring(0, 4), 10);
	var artists = [];
	for (var i = 0; i < track.artists.length; i++) {
		artists.push(track.artists[i].name);
		var containsArtist = (typeof(getArtistData(track.artists[i].name)) != "undefined");
		if (!containsArtist) {
			stats.artistData[currentArtistID++] = {
				name: track.artists[i].name,
				imgURL: '',
				genres: [],
				albums: []
			};
			stats.artistCount++;
			$.ajax({
				url: 'https://api.spotify.com/v1/artists/' + track.artists[i].id,
				headers: {
					'Authorization': 'Bearer ' + accessToken
				},
				success: function(response) {
					var artistData = getArtistData(response.name);
					artistData.genres = response.genres;
					artistData.imgURL = response.images[0];
				}
			});
		}
	}
	var albumName = filterAlbumName(track.album.name);
	var albumData = getAlbumData(albumName, track.artists[0].name);
	var containsAlbum = typeof(albumData) != "undefined";
	if (!containsAlbum) {
		stats.albumData[currentAlbumID++] = {
			name: albumName,
			year: year,
			imgURL: track.album.images[0].url,
			artists: artists,
			sources: [source],
			songs: [],
		};
		albumData = stats.albumData[currentAlbumID - 1];
		stats.albumCount++;
		for (var i = 0; i < artists.length; i++) {
			getArtistData(artists[i]).albums.push(currentAlbumID - 1);
		}
	} else {
		albumData.sources.push(source);
	}
	var trackName = filterTrackName(track.name);
	var trackData = getTrackData(trackName, albumName, track.artists[0].name);
	var containsTrack = typeof(trackData) != "undefined";
	console.log(trackName, albumName, containsTrack, trackData, albumData);
	if (!containsTrack) {
		stats.trackData[currentTrackID++] = {
			name: trackName,
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
		if ($.inArray(currentTrackID - 1, albumData.songs) == -1) {
			albumData.songs.push(currentTrackID - 1);
		}
		stats.songCount++;
	} else {
		trackData.sources.push(source);
	}
}

function getTrackData(name, album, artist) {
	for (var i = 0; i < stats.trackData.length; i++) {
		for (var j = 0; j < stats.albumData.length; j++) {
			if (stats.trackData[i].name.toUpperCase() == name.toUpperCase() && stats.albumData[j].name.toUpperCase() == album.toUpperCase() && $.inArray(i, stats.albumData[j].songs) != -1 && $.inArray(artist, stats.trackData[i].artists) != -1 && $.inArray(artist, stats.albumData[j].artists) != -1) {
				console.log(name, stats.trackData[i], stats.albumData[j]);
				return stats.trackData[i];
			}
		}
	}
	return undefined;
}

function getAlbumData(name, artist) {
	for (var i = 0; i < stats.albumData.length; i++) {
		if (stats.albumData[i].name.toUpperCase() == name.toUpperCase() && $.inArray(artist, stats.albumData[i].artists) != -1) {
			return stats.albumData[i];
		}
	}
	return undefined;
}

function getArtistData(name) {
	for (var i = 0; i < stats.artistData.length; i++) {
		if (stats.artistData[i].name.toUpperCase() == name.toUpperCase()) {
			return stats.artistData[i];
		}
	}
	return undefined;
}

function refilter() {
	filteredStats = new FilteredStats();
	for (var i = 0; i < stats.trackData.length; i++) {
		if (!isFiltered(stats.trackData[i])) {
			filteredStats.songs.push(i);
			var year = stats.trackData[i].year;
			if (year < filteredStats.minYear) {
				filteredStats.minYear = year;
			} else if (year > filteredStats.maxYear) {
				filteredStats.maxYear = year;
			}
			filteredStats.numSongs++;
		}
	}
	for (var i = 0; i < stats.albumData.length; i++) {
		var filtered = true;
		for (var j = 0; j < stats.albumData[i].songs.length; j++) {
			if (!isFiltered(stats.trackData[stats.albumData[i].songs[j]])) {
				filtered = false;
				break;
			}
		}
		if (!filtered) {
			filteredStats.albums.push(i);
			filteredStats.numAlbums++;
		}
	}
	for (var i = 0; i < stats.artistData.length; i++) {
		var filtered = true;
		for (var j = 0; j < stats.artistData[i].albums.length; j++) {
			for (var k = 0; k < stats.albumData[stats.artistData[i].albums[j]].songs.length; k++) {
				if (!isFiltered(stats.trackData[stats.albumData[stats.artistData[i].albums[j]].songs[k]])) {
					filtered = false;
					break;
				}
			}
		}
		if (!filtered) {
			filteredStats.artists.push(i);
			filteredStats.numArtists++;
		}
	}
}

function isFiltered(thing) {
	if (songFilters.length == 0) {
		return false;
	}
	var numMatched = 0;
	for (var i = 0; i < songFilters.length; i++) {
		for (var j = 0; j < thing.sources.length; j++) {
			if (songFilters[i] == thing.sources[j]) {
				numMatched++;
				break;
			}
		}
	}
	return (numMatched >= thing.sources.length);
}

function filterTrackName(name) {
	if (normalizeVersion) {
		return name.replace(/\s?\-?\s?\(?((\d+)|([a-zA-Z]+))?\s?Remaster((ed)|(s))?\s?(Version)?(\d\d\d\d)?\)?/g, "");
	} else {
		return name;
	}
}

function filterAlbumName(name) {
	if (normalizeVersion) {
		var nmStr = name;
		nmStr = nmStr.replace(/\s?\[?\(?((Deluxe)|(Expanded))?\s?\&?(\d\d\d\d)?\s?Remaster(ed)?\s?(Edition|Version)?\]?\)?/g, "");
		nmStr = nmStr.replace(/\(?(Deluxe|Expanded|Anniversary|Standard) Edition\)?/g, "");
		nmStr = nmStr.replace(/- $/g, "");
		nmStr = nmStr.replace(/\(Super Deluxe\)/g, "");
		nmStr = nmStr.replace(/\(?Deluxe Box Set\)?/g, "");
		nmStr = nmStr.replace(/\(?Bonus Track Version\)?/g, "");
		nmStr = nmStr.replace(/\(Deluxe\)/g, "");
		nmStr = nmStr.replace(/\(((U.S.)|International) Version\)/g, "");
		nmStr = nmStr.replace(/\(?\d\d\d?(th)?\s?Anniversary\)?/, "");
		return nmStr;
	} else {
		return name;
	}
}
