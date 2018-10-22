var charts = [];

function createBackgroundCharts() {
	var backColors = ["#1DB954BB", "#1DB954BB", "#1DB954BB", "#1DB954BB"];
	var borderColors = ["#1DB954", "#1DB954", "#1DB954", "#1DB954"];
	charts[0] = new Chart($("#back-chart-0"), {
		type: 'bar',
		data: {
			labels: ['a', 'b', 'c', 'd'],
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			events: [],
			scales: {
				XAxes: [{
					gridLines: {
						color: "#1db954"
					}
				}],
				yAxes: [{
					gridLines: {
						color: "#1db954"
					},
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
	charts[1] = new Chart($("#back-chart-1"), {
		type: 'doughnut',
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			events: []
		}
	});
	charts[2] = new Chart($("#back-chart-2"), {
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		type: 'polarArea',
		options: {
			responsive: false,
			events: []
		}
	});
	charts[3] = new Chart($("#back-chart-3"), {
		type: 'bar',
		data: {
			labels: ['a', 'b', 'c', 'd'],
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			events: [],
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
	charts[4] = new Chart($("#back-chart-4"), {
		type: 'doughnut',
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			events: []
		}
	});
	charts[5] = new Chart($("#back-chart-5"), {
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		type: 'polarArea',
		options: {
			responsive: false,
			events: []
		}
	});
	charts[6] = new Chart($("#back-chart-6"), {
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		type: 'polarArea',
		options: {
			responsive: false,
			events: []
		}
	});
	charts[7] = new Chart($("#back-chart-7"), {
		data: {
			datasets: [{
				label: '',
				data: [4, 10, 5, 2],
				backgroundColor: backColors,
				borderColor: borderColors,
				borderWidth: 1
			}]
		},
		type: 'polarArea',
		options: {
			responsive: false,
			events: []
		}
	});
	animateBackgroundCharts();
}

function animateBackgroundCharts() {
	for (var i = 0; i < charts.length; i++) {
		charts[i].data.datasets[0].data = [Math.random(), Math.random(), Math.random(), Math.random()];
		charts[i].update();
	}
	window.setTimeout(function() {
		animateBackgroundCharts()
	}, 1200);
}