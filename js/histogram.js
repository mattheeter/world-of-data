class Histogram {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 500,
      colorScale: _config.colorScale,
      year: _config.year || 2020,
      dataAttribute: _config.dataAttribute,
      label: _config.label,
      countries: _config.countries || [],
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
    }

    this.data = _data;

    // Call a class function
    this.initVis();
  }

  initVis() {
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    // Use constructor argument for nBins so that we can easily update it
    vis.colorScale = this.config.colorScale;
    vis.nBins = this.colorScale.length;
    vis.dataAttribute = this.config.dataAttribute;
    vis.year = this.config.year;
    vis.label = this.config.label;
    vis.countries = this.config.countries;
    vis.tooltipPadding = this.config.tooltipPadding;

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

    // Clear any previous stuff from updating
    vis.svg.selectAll("*").remove();

    // Filter by the provided year
    vis.displayedData = vis.data.filter(
        d => parseInt(d.Year) == vis.year
    )

    // And the included countries
    if (vis.countries.length > 1) {
        vis.displayedData = vis.displayedData.filter(
            d => vis.countries.includes(d.Entity)
        )
    }

    const [min, max] = d3.extent(Array.from(vis.displayedData, d => Number(d[vis.dataAttribute])));
    const step = (max - min) / vis.nBins;

    const thresholds = d3.range(min + step, max, step);

    // Create bins for the data
    let bins = d3.bin()
      .thresholds(thresholds)
      .value((d) => Number(d[vis.dataAttribute]))
    (vis.displayedData);

    // TODO: Confirm sizing and margins
    const x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([vis.config.margin.right, vis.width - vis.config.margin.left]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .range([vis.height - vis.config.margin.bottom, vis.config.margin.top]);
  
    vis.barsLayer = vis.svg.append("g");
    vis.brushLayer = vis.svg.append("g").attr("class", "brush");

    // Add the histogram as a group to the svg
    vis.bars = vis.barsLayer
        .selectAll()
        .data(bins)
        .join("rect")
            .attr("stroke", "black")
            .attr("fill", (_, i) => vis.colorScale[i])
            .attr("x", (d) => x(d.x0) + 1)
            .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
            .attr("y", (d) => y(d.length))
            .attr("height", (d) => y(0) - y(d.length));

    // Add the x-axis as a group to the svg
    vis.svg.append("g")
        .attr("transform", `translate(0, ${vis.height - vis.config.margin.bottom})`)
        .call(d3.axisBottom(x).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.config.margin.bottom - 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(vis.label));

    // Add the y-axis as a group to the svg
    vis.svg.append("g")
        .attr("transform", `translate(${vis.config.margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(vis.width / 80).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", vis.config.margin.left + 50)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Number of Countries"));
    
    vis.bars.on("mouseover", (event, d) => {
        d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.tooltipPadding) + 'px')
            .data(vis.displayedData)
            .html(`
             <div class="tooltip-title">
               ${vis.label}: ${d3.extent(Array.from(d, d => d[vis.dataAttribute])).join(" - ")} 
             </div>
              <ul>
              <li>Number of countries: ${Array.from(d, d => d[vis.dataAttribute]).length}</li>
              <li>Included countries: ${Array.from(d, d => d.Entity).join(", ")}</li>
              </ul>
            `);
    });

    vis.bars.on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
    });

    vis.brush = d3.brushX().on("start brush end", ({selection}) => {
        if (selection) {
            const [x0, x1] = selection;

            let selected_data = vis.bars
            .style("opacity", "0.3")
            .filter(d => {
                // If any point on a bar is encompassed by the brush, we include it. 
                let min = x(Math.min(...Array.from(d, d => Number(d[vis.dataAttribute]))))
                let max = x(Math.max(...Array.from(d, d => Number(d[vis.dataAttribute]))))
                return (
                    // The brush is within a bar
                    (x0 >= min && x1 <= max) ||
                    // The brush is partially in one and its neighbor
                    (x0 <= max && x1 >= max) ||
                    (x0 <= min && x1 >= min)
                )
            })
            .style("opacity", "1.0")
            .data()
            // This is an array of arrays, so we have to flatten it
            .flat();

            for (let i in vis.dependentVis) {
                vis.dependentVis[i].countries = Array.from(selected_data, d => d.Entity);
                vis.dependentVis[i].updateVis()
            }

        } else {
            vis.bars.style("opacity", "1.0");
        }
    });

    vis.brushLayer.call(vis.brush);
    vis.barsLayer.raise();
  }
}
