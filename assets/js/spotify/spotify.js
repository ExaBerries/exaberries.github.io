var chart = {};
var songFilters = [];
var currentListSongsYear = 0;

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
	for (var i = 0; i <= stats.maxYear - stats.minYear; i++) {
		chartLabels[i] = stats.minYear + i;
		chartBackgroundColors[i] = 'rgba(13, 169, 68, 0.8)';
		chartBorderColors[i] = 'rgba(13, 169, 68, 0.8)';
		chartData[i] = 0;
	}
	for (var id in stats.trackData) {
		if (!isFiltered(stats.trackData[id])) {
			chartData[stats.trackData[id].year - stats.minYear]++;
		}
	}
	chart.data.labels = chartLabels;
	chart.data.datasets[0].data = chartData;
	chart.data.datasets[0].backgroundColor = chartBorderColors;
	chart.data.datasets[0].borderColor = chartBackgroundColors;
	chart.update();
}

function listSongs(year) {
	currentListSongsYear = year;
	$("#songslist").html("");
	for (var id in stats.albumData) {
		if (stats.albumData[id].year == year) {
			if (!isFiltered(stats.albumData[id])) {
				var box = $("<div>", {class: "album-box"});
				box.append($("<h2>", {text: stats.albumData[id].name}));
				var img = $("<img>");
				img.attr('src', stats.albumData[id].imgURL);
				box.append(img);
				var list = $("<ol>");
				for (var i = 0; i < stats.albumData[id].songs.length; i++) {
					if (!isFiltered(stats.trackData[stats.albumData[id].songs[i]])) {
						list.append($("<li>").text(stats.trackData[stats.albumData[id].songs[i]].name));
					}
				}
				box.append(list);
				$("#songslist").append(box);
			}
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
		renderSongChart();
		if (currentListSongsYear != 0) {
			listSongs(currentListSongsYear);
		}
	});
	$("#filter-songs").append(btn);
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
