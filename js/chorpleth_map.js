class BivariateChoroplethMap {

  constructor(_config, _xData, _yData, _mapData) {
    this.config = {
      parentElement: _config.parentElement,
      chartTitle: _config.chartTitle,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 1100,
      year: _config.year || 2020,
      xDataAttribute: _config.xDataAttribute,
      yDataAttribute: _config.yDataAttribute,
      xLabel: _config.xLabel,
      yLabel: _config.yLabel,
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
    }

    this.xData = _xData;
    this.yData = _yData;
    this.mapData = _mapData;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.xDataAttribute = this.config.xDataAttribute;
    vis.yDataAttribute = this.config.yDataAttribute;
    vis.xLabel = this.config.xLabel;
    vis.yLabel = this.config.yLabel;
    vis.year = this.config.year;
    vis.title = this.config.chartTitle;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Combine the data with (year, country) as the key
    // Mapping from (year, country) to yData
    let yMap = new Map();
    vis.yData.forEach(
        d => yMap.set(d.Year + " " +  d.Code, d[vis.yDataAttribute])
    )

    // For each xData point, set the yData attribute
    vis.data = structuredClone(vis.xData)
    vis.data.forEach(
        (d, i) => vis.data[i][vis.yDataAttribute] = yMap.get(d.Year + " " +  d.Code)
    )

    vis.data = vis.data.filter(
        d => parseInt(d.Year) == vis.year
    )

    const xScale = d3.scaleQuantile()
        .domain(d3.extent(Array.from(vis.data, d => d[vis.xDataAttribute])))
        .range(d3.schemeBlues[5]);

    const yScale = d3.scaleQuantile()
        .domain(d3.extent(Array.from(vis.data, d => d[vis.yDataAttribute])))
        .range(d3.schemeReds[9]);

    // index is a mapping from each country name to its data
    const index = d3.index(vis.data, d => d.Entity);

    const projection = d3.geoMercator();
    const path = d3.geoPath(projection)

    // color takes in a data point and calculates the
    // amount into the x and y scales to get its color
    const color = (value) => {
        if (!value) return "#ffffff";
        x = value[vis.xDataAttribute]
        y = value[vis.yDataAttribute]
        return yScale(y);
    };

    const svg = d3.select(vis.config.parentElement)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("viewBox", [0, 0, vis.width, vis.height])
        .attr("style", "max-width: 100%; height: auto;");
  
    svg.append("g")
        .attr(
            "transform",
            `translate(200, ${vis.config.margin.top + 350})
            scale(1.6, 1.6)`
        )
        .selectAll("path")
        .data(vis.mapData.features)
        .join("path")
            .attr("fill", d => color(index.get(d.properties.name)))
            .attr("d", path)

    svg.append(legend)
        .attr("transform", "translate(870,450)");
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

legend = () => {
  const k = 24;
  const arrow = DOM.uid();
  return svg`<g font-family=sans-serif font-size=10>
  <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
    <marker id="${arrow.id}" markerHeight=10 markerWidth=10 refX=6 refY=3 orient=auto>
      <path d="M0,0L9,3L0,6Z" />
    </marker>
    ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
      <title>Diabetes${labels[j] && ` (${labels[j]})`}
Obesity${labels[i] && ` (${labels[i]})`}</title>
    </rect>`)}
    <line marker-end="${arrow}" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
    <line marker-end="${arrow}" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
    <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">Diabetes</text>
    <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">Obesity</text>
  </g>
</g>`;
}