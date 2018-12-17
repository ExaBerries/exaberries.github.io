var chart = {};
var currentListSongsYear = -1;

function run() {
	if (hasParam("access_token")) {
		var accessToken = getParam('access_token');
		console.log("accessToken=" + accessToken);
		getInfo(accessToken);
		refilter();
	} else {
		console.log("no access token");
		redirectToSpotifyAuth();
	}
}

function render() {
	renderGeneralStats();
	renderChrologicalStats();
}

function renderGeneralStats() {
	var totalLength = 0;
	for (var i = 0; i < filteredStats.songs.length; i++) {
		totalLength += stats.trackData[filteredStats.songs[i]].duration;
	}
	var avgLength = Math.round(totalLength / filteredStats.songs.length);
	$("#num-songs-stat").text(filteredStats.numSongs);
	if (filteredStats.numSongs.length != 1) {
		$("#num-songs-txt").text(" songs");
	} else {
		$("#num-songs-txt").text(" song");
	}
	$("#num-albums-stat").text(filteredStats.numAlbums);
	if (filteredStats.numAlbums.length != 1) {
		$("#num-albums-txt").text(" albums");
	} else {
		$("#num-albums-txt").text(" album");
	}
	$("#num-artists-stat").text(filteredStats.numArtists);
	if (filteredStats.numArtists.length != 1) {
		$("#num-artists-txt").text(" artists");
	} else {
		$("#num-artists-txt").text(" artist");
	}
	$("#avg-length-stat").text(msToTime(avgLength));
}

function renderChrologicalStats() {
	renderSongChart();
	listSongs(currentListSongsYear);
	var yearData = [];
	var weightedMeanYear = 0;
	var yearStdev = 0;
	for (var year = filteredStats.minYear; year < filteredStats.maxYear; year++) {
		yearData[year] = 0;
	}
	for (var i = 0; i < filteredStats.songs.length; i++) {
		var id = filteredStats.songs[i];
		yearData[stats.trackData[id].year]++;
	}
	var totalWeight = 0;
	for (var year = filteredStats.minYear; year < filteredStats.maxYear; year++) {
		var weight = yearData[year];
		weightedMeanYear += year * weight;
		totalWeight += weight;
	}
	weightedMeanYear /= totalWeight;
	weightedMeanYear = Math.round(weightedMeanYear);
	var sumOfSquares = 0;
	for (var year = filteredStats.minYear; year < filteredStats.maxYear; year++) {
		sumOfSquares += Math.pow(year - weightedMeanYear, 2);
	}
	yearStdev = Math.sqrt(sumOfSquares / (filteredStats.maxYear - filteredStats.minYear));
	$("#weighted-mean-year").text("weighted mean year " + weightedMeanYear);
	$("#year-stdev").text("standard deviation " + yearStdev.toFixed(2));
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

function renderSongChart() {
	var chartLabels = [];
	var chartData = [];
	var chartBackgroundColors = [];
	var chartBorderColors = [];
	for (var i = 0; i <= filteredStats.maxYear - filteredStats.minYear; i++) {
		chartLabels[i] = filteredStats.minYear + i;
		chartBackgroundColors[i] = 'rgba(13, 169, 68, 0.8)';
		chartBorderColors[i] = 'rgba(13, 169, 68, 0.8)';
		chartData[i] = 0;
	}
	for (var i = 0; i < filteredStats.songs.length; i++) {
		var id = filteredStats.songs[i];
		chartData[stats.trackData[id].year - filteredStats.minYear]++;
	}
	chart.data.labels = chartLabels;
	chart.data.datasets[0].data = chartData;
	chart.data.datasets[0].backgroundColor = chartBorderColors;
	chart.data.datasets[0].borderColor = chartBackgroundColors;
	chart.update();
}

function listSongs(year) {
	if (year == -1) {
		year = filteredStats.maxYear;
	}
	currentListSongsYear = year;
	$("#songslist").html("");
	$("#songslist-header").text(year + " Songs")
	for (var i = 0; i < filteredStats.albums.length; i++) {
		var id = filteredStats.albums[i];
		if (stats.albumData[id].year == year) {
			var box = $("<div>", {class: "album-box"});
			box.append($("<h2>", {text: stats.albumData[id].name}));
			var img = $("<img>");
			img.attr('src', stats.albumData[id].imgURL);
			box.append(img);
			var list = $("<ol>");
			for (var j = 0; j < stats.albumData[id].songs.length; j++) {
				if (filteredStats.songs.includes(stats.albumData[id].songs[j])) {
					list.append($("<li>").text(stats.trackData[stats.albumData[id].songs[j]].name));
				}
			}
			box.append(list);
			$("#songslist").append(box);
		}
	}
}

function createFilterButton(name) {
	var btn = $("<button>", {text: name, class: "toggle-btn-off"});
	btn.click(function() {
		if (btn.hasClass("toggle-btn-off")) {
			btn.removeClass("toggle-btn-off");
			btn.addClass("toggle-btn-on");
			songFilters.push(name);
		} else {
			btn.removeClass("toggle-btn-on");
			btn.addClass("toggle-btn-off");
			songFilters.splice($.inArray(name, songFilters), 1);
		}
		refilter();
		render();
	});
	var listItem = $("<li>");
	listItem.append(btn);
	$("#filter-songs-buttons").append(listItem);
}

function msToTime(s) {
	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	return mins + ':' + (secs < 10 ? "0" : "") + secs;
}
