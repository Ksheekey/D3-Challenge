// @TODO: YOUR CODE HERE!

// d3.csv("./assets/js/data.csv").then(function(d) {
//     console.log(d)

// }).catch(function(error) {
//     console.log(error);
//   });

//----------------------------------------//
function makeResponsive() {

  var svgArea = d3.select(".container").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = 960;
  var svgHeight = 500;
  
  var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
  };
  
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Import Data
  d3.csv("./assets/js/data.csv").then(function(censusData) {
  
      // Step 1: Parse Data/Cast as numbers
      // ==============================
      censusData.forEach(function(d) {
        d.income = +d.income; //hair length
        d.obesity = +d.obesity; // hits
      });
  
      // Step 2: Create scale functions
      // ==============================
      var xLinearScale = d3.scaleLinear()
        .domain([20, d3.max(censusData, d => d.income)])
        .range([0, width]);
  
      var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.obesity)])
        .range([height, 0]);
  
      // Step 3: Create axis functions
      // ==============================
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
  
      // Step 4: Append Axes to the chart
      // ==============================
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
  
      chartGroup.append("g")
        .call(leftAxis);
  
      // Step 5: Create Circles
      // ==============================
      var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .classed("stateCircle stateText", true)
      .attr("cx", d => xLinearScale(d.income))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", "15")
      //.attr("fill", "pink")
      .attr("opacity", ".5");

      var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

      circleLabels
      .attr("x", function(d) {
          return xLinearScale(d.income);
        })
        .attr("y", function(d) {
          return yLinearScale(d.obesity);
        })
        .text(function(d) {
          return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
  
      // Step 6: Initialize tool tip
      // ==============================
      var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br>Income: ${d.income}<br>Obesity: ${d.obesity}`);
        });
  
      // Step 7: Create tooltip in the chart
      // ==============================
      chartGroup.call(toolTip);
  
      // Step 8: Create event listeners to display and hide the tooltip
      // ==============================
      circlesGroup.on("mouseover", function(d) {
        
        toolTip.show(d, this);
      })
        // onmouseout event
        .on("mouseout", function(d, i) {
          toolTip.hide(d);
        });
  
      // Create axes labels
      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Obesity");
  
      chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("income");
    }).catch(function(error) {
      console.log(error);
    });
}

makeResponsive()

d3.select(window).on("resize", makeResponsive);
  