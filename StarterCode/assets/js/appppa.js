var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d[chosenYAxis]),
      d3.max(censusData, d => d[chosenYAxis])
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisBottom(newYScale);

  xAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {

  circlesXGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesXGroup;
}

function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {

  circlesYGroup.transition()
    .duration(1000)
    .attr("cx", d => newYScale(d[chosenYAxis]));

  return circlesYGroup;
}

// function used for updating circles group with new tooltip
function updateXToolTip(chosenXAxis, circlesXGroup) {

  var label;

  if (chosenXAxis === "income") {
    label = "Income:";
  }
  else {
    label = "Healthcare:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesXGroup.call(toolTip);

  circlesXGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
    // onmouseout event
    .on("mouseout", function(d, i) {
      toolTip.hide(d);
    });

  return circlesXGroup;
}

function updateYToolTip(chosenYAxis, circlesYGroup) {

  var label;

  if (chosenYAxis === "obesity") {
    label = "Obesity:";
  }
  else {
    label = "Age:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenYAxis]}`);
    });

  circlesYGroup.call(toolTip);

  circlesYGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
    // onmouseout event
    .on("mouseout", function(d, i) {
      toolTip.hide(d);
    });

  return circlesYGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/js/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(d) {
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.healthcare = +d.healthcare;
    d.age = +d.age
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    //.classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle d3-tip", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    //.attr("fill", "orange")
    .attr("opacity", ".5");

    // var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

    //   circleLabels
    //   .attr("x", function(d) {
    //       return xLinearScale(d.income);
    //     })
    //     .attr("y", function(d) {
    //       return yLinearScale(d.obesity);
    //     })
    //     .text(function(d) {
    //       return d.abbr;
    //     })
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "10px")
    //     .attr("text-anchor", "middle")
    //     .attr("fill", "white");
    
  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare");

  // append y axis
  var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity")
    //.classed("axis-text", true)
    .text("Obesity");

  var ageLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "age")
    //.classed("axis-text", true)
    .text("Age");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
