class Histogram {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      chartTitle: _config.chartTitle,
      containerWidth: _config.containerWidth || 960,
      containerHeight: _config.containerHeight || 500,
      nBins: _config.nBins || 20,
      year: _config.year || 2020,
      dataAttribute: _config.dataAttribute,
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
    }

    this.data = _data;

    // Call a class function
    this.initVis();
  }

  initVis() {
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    // Use constructor argument for nBins so that we can easily update it
    vis.nBins = this.config.nBins;
    vis.dataAttribute = this.config.dataAttribute;
    vis.year = this.config.year;
    vis.title = this.config.chartTitle;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.data = vis.data.filter(
        d => parseInt(d.Year) == vis.year
    )

    // Create bins for the data
    let bins = d3.bin()
      .thresholds(vis.nBins)
      .value((d) => d[vis.dataAttribute])
    (this.data);

    // TODO: Confirm sizing and margins
    const x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([vis.config.margin.right, vis.width - vis.config.margin.left]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .range([vis.height - vis.config.margin.bottom, vis.config.margin.top]);
  
    const svg = d3.select(vis.config.parentElement)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("viewBox", [0, 0, vis.width, vis.height])
        .attr("style", "max-width: 100%; height: auto;");
  
    // Add the histogram as a group to the svg
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(bins)
        .join("rect")
            .attr("x", (d) => x(d.x0) + 1)
            .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
            .attr("y", (d) => y(d.length))
            .attr("height", (d) => y(0) - y(d.length));

    // Add the x-axis as a group to the svg
    svg.append("g")
        .attr("transform", `translate(0, ${vis.height - vis.config.margin.bottom})`)
        .call(d3.axisBottom(x).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.config.margin.bottom - 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(vis.title));

    // Add the y-axis as a group to the svg
    svg.append("g")
        .attr("transform", `translate(${vis.config.margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.config.margin.left + 50)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Number of Countries"));
  }
}
//     //reusable functions for x and y 
//         //if you reuse a function frequetly, you can define it as a parameter
//         //also, maybe someday you will want the user to be able to re-set it.
//     vis.xValue = d => d.year; 
//     vis.yValue = d => d.cost;

//     //setup scales
//     vis.xScale = d3.scaleLinear()
//         .domain(d3.extent(vis.data, vis.xValue)) //d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year) );
//         .range([0, vis.width]);

//     vis.yScale = d3.scaleLinear()
//         .domain( d3.extent(vis.data, vis.yValue) )
//         .range([vis.height, 0])
//         .nice(); //this just makes the y axes behave nicely by rounding up

//     // Define size of SVG drawing area
//     vis.svg = d3.select(vis.config.parentElement)
//         .attr('width', vis.config.containerWidth)
//         .attr('height', vis.config.containerHeight);

//     // Append group element that will contain our actual chart (see margin convention)
//     vis.chart = vis.svg.append('g')
//         .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


//     // Initialize axes
//     vis.xAxis = d3.axisBottom(vis.xScale);
//     vis.yAxis = d3.axisLeft(vis.yScale);

//     // Append x-axis group and move it to the bottom of the chart
//     vis.xAxisG = vis.chart.append('g')
//         .attr('class', 'axis x-axis')
//         .attr('transform', `translate(0,${vis.height})`)
//         .call(vis.xAxis);
    
//     // Append y-axis group
//     vis.yAxisG = vis.chart.append('g')
//         .attr('class', 'axis y-axis')
//         .call(vis.yAxis); 

//     vis.updateVis();


//   }


//   //leave this empty for now
//  updateVis() { 
//     let vis = this;

//    // Initialize area generator- helper function 
//     vis.area = d3.area()
//         .x(d => vis.xScale(vis.xValue(d)))
//         .y1(d => vis.yScale(vis.yValue(d)))
//         .y0(vis.height);

//     // Add area path
//     vis.chart.append('path')
//         .data([vis.data]) 
//         .attr('fill', '#e9eff5')
//         .attr('d', vis.area);


//     //Initialize line generator helper function
//     vis.line = d3.line()
//         .x(d => vis.xScale(vis.xValue(d)))
//         .y(d => vis.yScale(vis.yValue(d)));


//     // Add line path 
//     vis.chart.append('path')
//         .data([vis.data])
//         .attr('stroke',  '#8693a0')
//         .attr('stroke-width', 2)
//         .attr('fill', 'none')
//         .attr('d', vis.line);

//  }


//  //leave this empty for now...
//  renderVis() { 

//   }



// }