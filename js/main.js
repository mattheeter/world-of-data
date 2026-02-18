let xDataSelection = "data/food/daily_calories_per_capita/data.csv"
let yDataSelection = "data/health/life_expectancy/data.csv"
let topo = "data/map/data.json"

d3.csv(xDataSelection)
  .then(data => {
	let calorieHistogram = new Histogram({
		"parentElement": "#calories-available-distribution",
        "chartTitle": "Daily Supply of Calories",
        "dataAttribute": "All food - Food available for consumption (kilocalories per day per capita)"
	}, data);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

d3.csv(yDataSelection)
  .then(data => {
	let lifeExpectancyHistogram = new Histogram({
		"parentElement": "#life-expectancy-distribution",
        "chartTitle": "Life Expectancy at age 0",
        "dataAttribute": "Life Expectancy, age 0"
	}, data);
    yData = data;

})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

// Construct the scatter plot
Promise.all([
  d3.csv(xDataSelection),
  d3.csv(yDataSelection),
]).then(data => {
    x = data[0];
    y = data[1];

  	// Create an instance (for example in main.js)
	let scatterPlot = new ScatterPlot({
		"parentElement": "#calories-life-expectancy-correlation",
        "containerWidth": 2000,
        "chartTitle": "Life Expectancy at age 0",
        "xDataAttribute": "All food - Food available for consumption (kilocalories per day per capita)",
        "yDataAttribute": "Life Expectancy, age 0",
        "xLabel": "Daily Supply of Calories",
        "yLabel": "Life Expectancy at age 0",
	}, x, y);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});


// Construct the chorpleth maps
Promise.all([
  d3.csv(xDataSelection),
  d3.csv(yDataSelection),
  d3.json(topo),
]).then(data => {
    cals = data[0];
    life = data[1];
    topo = data[2];

  	// Create an instance (for example in main.js)
	let calorie_choropleth = new BivariateChoroplethMap({
		"parentElement": "#calorie-map",
        "containerWidth": 1200,
        "containerHeight": 900,
        "label": "Daily Supply of Calories",
        colorScale: d3.schemeBlues[8],
        "dataAttribute": "All food - Food available for consumption (kilocalories per day per capita)",
	}, cals, topo);

    let life_choropleth = new BivariateChoroplethMap({
		"parentElement": "#life-map",
        "containerWidth": 1200,
        "containerHeight": 900,
        colorScale: d3.schemeReds[8],
        "label": "Life Expectancy from 0",
        "dataAttribute": "Life Expectancy, age 0",
	}, life, topo);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});


d3.select("#x-button").on("click", function() {
    if (this.value == xDataSelection) {
        // If the selected value does not change, do nothing
        return;
    }
    xDataSelection = this.value;
});


d3.select("#y-button").on("click", function() {
    if (this.value == xDataSelection) {
        // If the selected value does not change, do nothing
        return;
    }
    yDataSelection = this.value;
});
