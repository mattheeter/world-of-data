d3.csv("data/food/daily_calories_per_capita/data.csv")
  .then(data => {
  	// Create an instance (for example in main.js)
	let calorie_histogram = new Histogram({
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
    console.log(data);

  	// Create an instance (for example in main.js)
	let calorie_histogram = new Histogram({
		"parentElement": "#life-expectancy-distribution",
        "chartTitle": "Life Expectancy at age 0",
        "dataAttribute": "Life Expectancy, age 0"
	}, data);

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
