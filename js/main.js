d3.csv("data/food/daily_calories_per_capita/data.csv")
  .then(data => {
  	// Create an instance (for example in main.js)
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


d3.csv("data/health/life_expectancy/data.csv")
  .then(data => {

  	// Create an instance (for example in main.js)
	let lifeExpectancyHistogram = new Histogram({
		"parentElement": "#life-expectancy-distribution",
        "chartTitle": "Life Expectancy at age 0",
        "dataAttribute": "Life Expectancy, age 0"
	}, data);

})
.catch(error => {
    console.error('Error:');
    console.log(error);
});


// Construct the scatter plot
Promise.all([
  d3.csv("data/food/daily_calories_per_capita/data.csv"),
  d3.csv("data/health/life_expectancy/data.csv"),
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


// Construct the chorpleth map
Promise.all([
  d3.csv("data/food/daily_calories_per_capita/data.csv"),
  d3.csv("data/health/life_expectancy/data.csv"),
  d3.json("data/map/data.json"),
]).then(data => {
    x = data[0];
    y = data[1];
    topo = data[2];

  	// Create an instance (for example in main.js)
	let choropleth = new BivariateChoroplethMap({
		"parentElement": "#map",
        "containerWidth": 2000,
        "chartTitle": "Life Expectancy at age 0",
        "xDataAttribute": "All food - Food available for consumption (kilocalories per day per capita)",
        "yDataAttribute": "Life Expectancy, age 0",
        "xLabel": "Daily Supply of Calories",
        "yLabel": "Life Expectancy at age 0",
	}, x, y, topo);
})
.catch(error => {
    console.error('Error:');
    console.log(error);
});

/**
 * Event listener: use color legend as filter
 */
// d3.selectAll('.legend-btn').on('click', function() {
//   console.log("button! ");
//   // Toggle 'inactive' class
//   // Assign class with `classed`, which will assign if not currently inactive
//   // or will un-assign if currently active.
//   d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
//   console.log(this)
  
//   // Check which categories are active
//   let selectedCategory = [];
//   d3.selectAll('.legend-btn:not(.inactive)').each(function() {
//     selectedCategory.push(d3.select(this).attr('category'));
//   });

//   // Filter data accordingly and update vis
//   timelineCircles.data = data.filter(d => selectedCategory.includes(d.category)) ;
//   timelineCircles.updateVis();
// });
