let xDataSelection = "All food - Food available for consumption (kilocalories per day per capita)"
let yDataSelection = "Life Expectancy, age 0"
let data, xData, yData, topoData;
let xHistogram, yHistogram, scatterPlot, xChoropleth, yChoropleth;


// Mapping of data attribute names to indices in the array of loaded data
let dataMap = new Map();
dataMap.set(xDataSelection, 0);
dataMap.set(yDataSelection, 1);


Promise.all([
    d3.csv("data/food/daily_calories_per_capita/data.csv"),
    d3.csv("data/health/life_expectancy/data.csv"),
    d3.json("data/map/data.json"),
]).then(_data => {
    data = _data;
    xData = data[dataMap.get(xDataSelection)];
    yData = data[dataMap.get(yDataSelection)];
    topoData = data[2];

	xHistogram = new Histogram({
		"parentElement": "#calories-available-distribution",
        "chartTitle": "Daily Supply of Calories",
        "dataAttribute": xDataSelection,
	}, xData);


	yHistogram = new Histogram({
		"parentElement": "#life-expectancy-distribution",
        "chartTitle": "Life Expectancy at age 0",
        "dataAttribute": yDataSelection,
	}, yData);

  	// Create an instance (for example in main.js)
	scatterPlot = new ScatterPlot({
		"parentElement": "#calories-life-expectancy-correlation",
        "containerWidth": 2000,
        "chartTitle": "Life Expectancy at age 0",
        "xDataAttribute": xDataSelection,
        "yDataAttribute": yDataSelection,
        "xLabel": "Daily Supply of Calories",
        "yLabel": "Life Expectancy at age 0",
	}, xData, yData);

  	// Create an instance (for example in main.js)
	xChoropleth = new BivariateChoroplethMap({
		"parentElement": "#calorie-map",
        "containerWidth": 1200,
        "containerHeight": 900,
        "label": "Daily Supply of Calories",
        colorScale: d3.schemeBlues[8],
        "dataAttribute": xDataSelection,
	}, xData, topoData);

    yChoropleth = new BivariateChoroplethMap({
		"parentElement": "#life-map",
        "containerWidth": 1200,
        "containerHeight": 900,
        colorScale: d3.schemeReds[8],
        "label": "Life Expectancy from 0",
        "dataAttribute": yDataSelection,
	}, yData, topoData);
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
    newData = data[dataMap.get(xDataSelection)];

    xHistogram.data = newData;
    xHistogram.dataAttribute = xDataSelection;
    xHistogram.updateVis();

    scatterPlot.xData = newData;
    scatterPlot.xDataAttribute = xDataSelection;
    scatterPlot.updateVis();

    xChoropleth.data = newData;
    xChoropleth.dataAttribute = xDataSelection;
    xChoropleth.updateVis();
});


d3.select("#y-button").on("click", function() {
    if (this.value == yDataSelection) {
        // If the selected value does not change, do nothing
        return;
    }
    yDataSelection = this.value;
    newData = data[dataMap.get(yDataSelection)];

    yHistogram.data = newData;
    yHistogram.dataAttribute = yDataSelection;
    yHistogram.updateVis();

    scatterPlot.yData = newData;
    scatterPlot.yDataAttribute = yDataSelection;
    scatterPlot.updateVis();

    yChoropleth.data = newData;
    yChoropleth.dataAttribute = yDataSelection;
    yChoropleth.updateVis();
});
