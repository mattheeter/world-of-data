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
      countries: _config.countries || [],
      brushingDisabled: _config.brushingDisabled || false,
      margin: { top: 10, bottom: 30, right: 50, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
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
    vis.label = this.config.label;
    vis.countries = this.config.countries;
    vis.tooltipPadding = this.config.tooltipPadding;
    vis.brushingDisabled = this.config.brushingDisabled;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("viewBox", [0, 0, vis.width, 625])
        .attr("style", "max-width: 100%; height: auto;");

    this.updateVis();
  }
  
  updateVis() {
    let vis = this;

    vis.svg.selectAll("*").remove();

    vis.displayedData = vis.data.filter(
        d => parseInt(d.Year) == vis.year
    )

    const scale = d3.scaleQuantile()
        .domain(d3.extent(Array.from(vis.displayedData, d => Number(d[vis.dataAttribute]))))
        .range(vis.colorScale);

    // index is a mapping from each country name to its data
    const index = d3.index(vis.displayedData, d => d.Entity);

    const projection = d3.geoMercator();
    const path = d3.geoPath(projection)

    // color takes in a data point and calculates the
    // amount into the x and y scales to get its color
    const color = (name) => {
        let value = index.get(name)
        if (!value) return "#423838"
        return scale(Number(value[vis.dataAttribute]));
    };

    vis.brushLayer = vis.svg.append("g").attr("class", "brush");
    vis.mapLayer = vis.svg.append("g");

    vis.map = vis.mapLayer
        .attr(
            "transform",
            `translate(0, ${vis.config.margin.top + 220})
            scale(.9, .9)`
        )
        .selectAll("path")
        .data(vis.mapData.features)
        .join("path")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5")
            .attr("d", path)
            .attr("fill", d => color(d.properties.name))
            .attr("opacity", d => {
                if (!(vis.countries.length)) {
                    return "1.0"
                }
                if (vis.countries.includes(d.properties.name)) {
                    return "1.0"
                }
                return "0.1"
            });

    // Build the legend
    const boxScale = d3.scaleLinear()
        .domain(d3.extent(scale.domain()))
        .range([vis.config.margin.left, vis.width - vis.config.margin.right]);

    vis.svg.append("g")
        .attr("transform", `translate(0, ${vis.config.margin.top + 20})`)
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

    vis.scale = vis.svg.append("g")
        .attr("transform", `translate(0, ${vis.config.margin.top + 30})`)
        .call(
            d3.axisTop(boxScale).tickValues([0, ...scale.quantiles()]).tickSize(6)
        )
        .attr("style", "font-size: 18px")
        .append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.config.margin.top - 37)
            .attr("style", "font-size: 18px")
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(vis.label);
    
    vis.map.on("mouseover", (event, d) => {
        d = index.get(d.properties.name)
        d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.tooltipPadding) + 'px')
            .data(vis.displayedData)
            .html(`
             <div class=tooltip-title>${d.Entity}</div>
              <ul>
              <li>${vis.label}: ${d[vis.dataAttribute]}</li>
              </ul>
            `);
    });

    vis.map.on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
    });

    vis.brush = d3.brush().on("start brush end", ({selection}) => {
        if (vis.brushingDisabled) {
            // Antoher vis is currently brushing, don't enable this one to
            vis.brush.move(vis.brushLayer, null);
            return;
        }
        if (selection) {
            let [[x0, y0], [x1, y1]] = selection;
            x0 -= vis.config.margin.left; 
            x1 -= vis.config.margin.left;
            y0 -= vis.config.margin.top + 150; 
            y1 -= vis.config.margin.top + 150;

            let selected_data = vis.map
            .style("opacity", "0.1")
            .filter(d => {
                // If any point on a bar is encompassed by the brush, we include it. 
                let [[minX, minY], [maxX, maxY]] = path.bounds(d);
                console.log(minY, maxY)

                return (
                    minX < x1 &&
                    maxX > x0 &&
                    minY < y1 &&
                    maxY > y0
                )
            })
            .style("opacity", "1.0")
            .data()
            // This is an array of arrays, so we have to flatten it

            for (let i in vis.dependentVis) {
                vis.dependentVis[i].countries = Array.from(selected_data, d => d.properties.name);
                vis.dependentVis[i].brushingDisabled = true;
                vis.dependentVis[i].updateVis()
            }

        } else {
            vis.map.style("opacity", "1.0");
            for (let i in vis.dependentVis) {
                vis.dependentVis[i].brushingDisabled = false;
                vis.dependentVis[i].countries = [];
                vis.dependentVis[i].updateVis()
            }
        }
    });

    vis.brushLayer.call(vis.brush);

    vis.brushLayer.call(vis.brush);
    vis.mapLayer.raise();
  }
}