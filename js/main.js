let xDataSelection = "All food - Food available for consumption (kilocalories per day per capita)"
let yDataSelection = "Life Expectancy, age 0"
let data, xData, yData, topoData;
let xHistogram, yHistogram, scatterPlot, xChoropleth, yChoropleth;

// Mapping of data attribute names to indices in the array of loaded data
let dataMap = new Map();
dataMap.set(xDataSelection, 0);
dataMap.set(yDataSelection, 1);
dataMap.set("Share of the population who cannot afford a healthy diet", 2);
dataMap.set("Health expenditure per capita, PPP", 3);

let labelMap = new Map();
labelMap.set(xDataSelection, "Daily Per-Capita Supply of Calories");
labelMap.set(yDataSelection, "Life Expectancy from Birth");
labelMap.set("Share of the population who cannot afford a healthy diet", "% Population Cannot Afford Healthy Diet");
labelMap.set("Health expenditure per capita, PPP", "Per-Captia Health Expenditure");


let nBins = 9
let xColorScale = d3.schemeBlues[nBins];
let yColorScale = d3.schemeReds[nBins];

Promise.all([
    d3.csv("data/food/daily_calories_per_capita/data.csv"),
    d3.csv("data/health/life_expectancy/data.csv"),
    d3.csv("data/food/cannot_afford_enough/data.csv"),
    d3.csv("data/health/healthcare_spending/data.csv"),
    d3.json("data/map/data.json"),
]).then(_data => {
    data = _data;
    xData = data[dataMap.get(xDataSelection)];
    yData = data[dataMap.get(yDataSelection)];
    topoData = data[data.length - 1];

	xHistogram = new Histogram({
		"parentElement": "#calories-available-distribution",
        "containerHeight": 250,
        "chartTitle": "Daily Supply of Calories",
        "dataAttribute": xDataSelection,
        "label": labelMap.get(xDataSelection),
        "colorScale": xColorScale,
	}, xData);

	yHistogram = new Histogram({
		"parentElement": "#life-expectancy-distribution",
        "containerHeight": 250,
        "chartTitle": "Life Expectancy at age 0",
        "dataAttribute": yDataSelection,
        "label": labelMap.get(yDataSelection),
        "colorScale": yColorScale,
	}, yData);

	scatterPlot = new ScatterPlot({
		"parentElement": "#calories-life-expectancy-correlation",
        "containerHeight": 250,
        "containerWidth": 2000,
        "chartTitle": "Life Expectancy at age 0",
        "xDataAttribute": xDataSelection,
        "yDataAttribute": yDataSelection,
        "xLabel": labelMap.get(xDataSelection),
        "yLabel": labelMap.get(yDataSelection),
	}, xData, yData);

  	// Create an instance (for example in main.js)
	xChoropleth = new BivariateChoroplethMap({
		"parentElement": "#calorie-map",
        "containerWidth": 1200,
        "containerHeight": 600,
        "label": "Daily Supply of Calories",
        "colorScale": xColorScale,
        "dataAttribute": xDataSelection,
        "label": labelMap.get(xDataSelection),
	}, xData, topoData);

    yChoropleth = new BivariateChoroplethMap({
		"parentElement": "#life-map",
        "containerWidth": 1200,
        "containerHeight": 600,
        "colorScale": yColorScale,
        "label": "Life Expectancy from 0",
        "dataAttribute": yDataSelection,
        "label": labelMap.get(yDataSelection),
	}, yData, topoData);

    xHistogram.dependentVis = [yHistogram, scatterPlot, xChoropleth, yChoropleth];
    yHistogram.dependentVis = [xHistogram, scatterPlot, xChoropleth, yChoropleth];
    scatterPlot.dependentVis = [xHistogram, yHistogram, xChoropleth, yChoropleth];
    xChoropleth.dependentVis = [xHistogram, yHistogram, scatterPlot, yChoropleth];
    yChoropleth.dependentVis = [xHistogram, yHistogram, scatterPlot, xChoropleth];
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
    newLabel = labelMap.get(xDataSelection);

    xHistogram.data = newData;
    xHistogram.dataAttribute = xDataSelection;
    xHistogram.label = newLabel;
    xHistogram.updateVis();

    scatterPlot.xData = newData;
    scatterPlot.xDataAttribute = xDataSelection;
    scatterPlot.xLabel = newLabel;
    scatterPlot.updateVis();

    xChoropleth.data = newData;
    xChoropleth.dataAttribute = xDataSelection;
    xChoropleth.label = newLabel;
    xChoropleth.updateVis();
});


d3.select("#y-button").on("click", function() {
    if (this.value == yDataSelection) {
        // If the selected value does not change, do nothing
        return;
    }
    yDataSelection = this.value;
    newData = data[dataMap.get(yDataSelection)];
    newLabel = labelMap.get(yDataSelection);

    yHistogram.data = newData;
    yHistogram.dataAttribute = yDataSelection;
    yHistogram.label = newLabel;
    yHistogram.updateVis();

    scatterPlot.yData = newData;
    scatterPlot.yDataAttribute = yDataSelection;
    scatterPlot.yLabel = newLabel;
    scatterPlot.updateVis();

    yChoropleth.data = newData;
    yChoropleth.dataAttribute = yDataSelection;
    yChoropleth.label = newLabel;
    yChoropleth.updateVis();
});


d3.select("#year-slider").on("input", function() {
    let year = this.value;

    xHistogram.year = year;
    xHistogram.updateVis();

    yHistogram.year = year;
    yHistogram.updateVis();

    scatterPlot.year = year;
    scatterPlot.updateVis();

    xChoropleth.year = year;
    xChoropleth.updateVis();

    yChoropleth.year = year;
    yChoropleth.updateVis();
});


d3.select("#bin-slider").on("input", function() {
    nBins = this.value
    xColorScale = d3.schemeBlues[nBins];
    yColorScale = d3.schemeReds[nBins];

    xHistogram.colorScale = xColorScale;
    xHistogram.updateVis();

    yHistogram.colorScale = yColorScale;
    yHistogram.updateVis();

    xChoropleth.colorScale = xColorScale
    xChoropleth.updateVis();

    yChoropleth.colorScale = yColorScale
    yChoropleth.updateVis();
});