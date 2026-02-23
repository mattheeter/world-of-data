class ScatterPlot {

  constructor(_config, _xData, _yData) {
    this.config = {
      parentElement: _config.parentElement,
      chartTitle: _config.chartTitle,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 500,
      year: _config.year || 2020,
      dependentVis: _config.dependentVis,
      xDataAttribute: _config.xDataAttribute,
      yDataAttribute: _config.yDataAttribute,
      xLabel: _config.xLabel,
      yLabel: _config.yLabel,
      countries: _config.countries || [],
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
    }

    this.xData = _xData;
    this.yData = _yData;

    // Call a class function
    this.initVis();
  }

  initVis() {
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    vis.xDataAttribute = this.config.xDataAttribute;
    vis.yDataAttribute = this.config.yDataAttribute;
    vis.xLabel = this.config.xLabel;
    vis.yLabel = this.config.yLabel;
    vis.year = this.config.year;
    vis.title = this.config.chartTitle;
    vis.countries = this.config.countries;
    vis.tooltipPadding = this.config.tooltipPadding;
    vis.dependentVis = this.config.dependentVis;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


    vis.svg = d3.select(vis.config.parentElement)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("viewBox", [0, 0, vis.width, vis.height])
        .attr("style", "max-width: 100%; height: auto;");

    this.updateVis();
    }

  updateVis() {
    let vis = this;
    
    vis.svg.selectAll("*").remove();

    // Combine the data with (year, country) as the key
    // Mapping from (year, country) to yData
    let yMap = new Map();
    vis.yData.forEach(
        d => yMap.set(d.Year + " " +  d.Code, d[vis.yDataAttribute])
    )

    // For each xData point, set the yData attribute
    vis.displayedData = structuredClone(vis.xData)
    vis.displayedData.forEach(
        (d, i) => vis.displayedData[i][vis.yDataAttribute] = yMap.get(d.Year + " " +  d.Code)
    )

    vis.displayedData = vis.displayedData.filter(
        d => parseInt(d.Year) == vis.year
    )

    // if (vis.countries.length > 1) {
    //     vis.displayedData = vis.displayedData.filter(
    //         d => vis.countries.includes(d.Entity)
    //     )
    // }

    const x = d3.scaleLinear()
        .domain(d3.extent(vis.displayedData, d => Number(d[vis.xDataAttribute]))).nice()
        .range([vis.config.margin.right, vis.width - vis.config.margin.left]);

    const y = d3.scaleLinear()
        .domain(d3.extent(vis.displayedData, d => Number(d[vis.yDataAttribute]))).nice()
        .range([vis.height - vis.config.margin.bottom, vis.config.margin.top]);

    // Add the x-axis as a group to the svg
    vis.svg.append("g")
        .attr("transform", `translate(0, ${vis.height - vis.config.margin.bottom})`)
        .call(d3.axisBottom(x).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.config.margin.bottom - 2)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text(vis.xLabel));

    // Add the y-axis as a group to the svg
    vis.svg.append("g")
        .attr("transform", `translate(${vis.config.margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.config.margin.left + 60)
            .attr("y", 8)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text(vis.yLabel));
  
    // Define separate layers so brushing doesn't block hover events
    vis.pointsLayer = vis.svg.append("g");
    vis.brushLayer = vis.svg.append("g").attr("class", "brush");
    
    vis.points = vis.pointsLayer
        .selectAll()
        .data(vis.displayedData)
        .join("circle")
            .attr("fill", d => {
                if (!(vis.countries.length)) {
                    return "steelblue"
                }
                if (vis.countries.includes(d.Entity)) {
                    return "steelblue"
                }
                return "white"
            })
            .attr("stroke", d => {
                if (!(vis.countries.length)) {
                    return "steelblue"
                }
                if (vis.countries.includes(d.Entity)) {
                    return "steelblue"
                }
                return "gray"
            })
            .attr("cx", d => x(Number(d[vis.xDataAttribute])))
            .attr("cy", d => y(Number(d[vis.yDataAttribute])))
            .attr("r", 5);

    
    vis.points.on("mouseover", (event, d) => {
        d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.tooltipPadding) + 'px')
            .data(vis.displayedData)
            .html(`
             <div class=tooltip-title>${d.Entity}</div>
              <ul>
              <li>${vis.xLabel}: ${d[vis.xDataAttribute]}</li>
              <li>${vis.yLabel}: ${d[vis.yDataAttribute]}</li>
              </ul>
            `);
    });

    vis.points.on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
    });

    vis.brush = d3.brush().on("start brush end", ({selection}) => {
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            let selected_data = vis.points
            .style("fill", "white")
            .style("stroke", "gray")
            .filter(d => x0 <= x(d[vis.xDataAttribute]) && x(d[vis.xDataAttribute]) < x1
                    && y0 <= y(d[vis.yDataAttribute]) && y(d[vis.yDataAttribute]) < y1)
            .style("fill", "steelblue")
            .style("stroke", "steelblue")
            .data()

            for (let i in vis.dependentVis) {
                vis.dependentVis[i].countries = Array.from(selected_data, d => d.Entity);
                vis.dependentVis[i].updateVis()
            }

        } else {
            vis.points.style("fill", "steelblue");
        }
    });

    vis.brushLayer.call(vis.brush);
    vis.pointsLayer.raise();
    }
}