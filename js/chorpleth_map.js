class BivariateChoroplethMap {

  constructor(_config, _data, _mapData) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 1100,
      colorScale: _config.colorScale,
      year: _config.year || 2020,
      dataAttribute: _config.dataAttribute,
      label: _config.label,
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
    }

    this.data = _data;
    this.mapData = _mapData;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.label = this.config.label;
    vis.year = this.config.year;
    vis.dataAttribute = this.config.dataAttribute
    vis.colorScale = this.config.colorScale;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.data = vis.data.filter(
        d => parseInt(d.Year) == vis.year
    )

    const scale = d3.scaleQuantile()
        .domain(d3.extent(Array.from(vis.data, d => d[vis.dataAttribute])))
        .range(vis.colorScale);

    // index is a mapping from each country name to its data
    const index = d3.index(vis.data, d => d.Entity);

    const projection = d3.geoMercator();
    const path = d3.geoPath(projection)

    // color takes in a data point and calculates the
    // amount into the x and y scales to get its color
    const color = (name) => {
        let value = index.get(name)
        if (!value) return "#423838"
        return scale(value[vis.dataAttribute]);
    };

    const svg = d3.select(vis.config.parentElement)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("viewBox", [0, 0, vis.width, 625])
        .attr("style", "max-width: 100%; height: auto;");
  
    svg.append("g")
        .attr(
            "transform",
            `translate(0, ${vis.config.margin.top + 100})
            scale(1.1, 1.1)`
        )
        .selectAll("path")
        .data(vis.mapData.features)
        .join("path")
            .attr("stroke", "white")
            .attr("stroke-width", "0.5")
            .attr("fill", d => color(d.properties.name))
            .attr("d", path)

    // Build the legend
    const boxScale = d3.scaleLinear()
        .domain(d3.extent(scale.quantiles()))
        .range([vis.config.margin.left, vis.width - vis.config.margin.right]);

    svg.append("g")
        .attr("transform", `translate(0, ${vis.config.margin.top + 600})`)
        .selectAll("rect")
        .data(scale.range())
        .join("rect")
        .attr("x", (d, i) => {
            const x0 = i === 0 ? boxScale.domain()[0] : scale.quantiles()[i - 1];
            return boxScale(x0);
        })
        .attr("y", vis.config.margin.top)
        .attr("width", (d, i) => {
            const x0 = i === 0 ? boxScale.domain()[0] : scale.quantiles()[i - 1];
            const x1 = i < scale.quantiles().length ? scale.quantiles()[i] : boxScale.domain()[1];
            return boxScale(x1) - boxScale(x0);
        })
        .attr("height", 15)
        .attr("fill", d => d);

    svg.append("g")
        .attr("transform", `translate(0, ${vis.config.margin.top + 625})`)
        .call(d3.axisBottom(boxScale)
            .tickValues([0, ...scale.quantiles()])
            .tickSize(6));
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



// // }

// legend = () => {
//   const k = 24;
//   const arrow = DOM.uid();
//   return svg`<g font-family=sans-serif font-size=10>
//   <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
//     <marker id="${arrow.id}" markerHeight=10 markerWidth=10 refX=6 refY=3 orient=auto>
//       <path d="M0,0L9,3L0,6Z" />
//     </marker>
//     ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
//       <title>Diabetes${labels[j] && ` (${labels[j]})`}
// Obesity${labels[i] && ` (${labels[i]})`}</title>
//     </rect>`)}
//     <line marker-end="${arrow}" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
//     <line marker-end="${arrow}" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
//     <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">Diabetes</text>
//     <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">Obesity</text>
//   </g>
// </g>`;
// }