// set default axes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function to update x-scale variable option when x-axis label is clicked
function xScale(data, chosenXAxis, chartWidth) {

    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * .8,
            d3.max(data, d => d[chosenXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function to update x-axis variable option when x-axis label is clicked
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function to update y-scale variable option when y-axis label is clicked
function yScale(data, chosenYAxis, chartHeight) {

    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * .8,
            d3.max(data, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// function to update y-axis variable option when y-axis label is clicked
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function to update circles group with transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// function to update text in circles group with transition to new text
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return circletextGroup;
}

// function to update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

    // x-axis 
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }

    // y-axis 
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }

    // tooltip
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (chosenXAxis === "age") {

                // all y-axis tooltip labels presented and formatted as percentages
                // age is without any formatting on x-axis
                return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {

                // income in dollars for x-axis
                return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else {

                // poverty as percentage for x-axis
                return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
                }      
        });

    circlesGroup.call(toolTip);

    // create "mouseover" event listener to display tool tip
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

function makeResponsive() {

    // select div by scatter id
    var svgArea = d3.select("#scatter").select("svg");

    // clear svg
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // set svg params
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;

    // set margins
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };

    // set chart area
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // create svg wrapper and append an SVG group that will hold chart
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // append svg group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("D3_data_journalism/assets/data/data.csv").then(function(demoData, err) {
        if (err) throw err;

        // parse out data
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });

        // set x/y linear scales
        var xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
        var yLinearScale = yScale(demoData, chosenYAxis, chartHeight);

        // set initial axis functions
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x-axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y-axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // set data for circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);
        
        var elemEnter = circlesGroup.enter();

        // create circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);

        // create circle text
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);

        // update tool tip function 
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);

        // add x-label groups and labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // add y-labels group and labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        // x-label event listener 
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                chosenXAxis = d3.select(this).attr("value");
                xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
                xAxis = renderXAxes(xLinearScale, xAxis);
                
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // update all circle information
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
                circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            });

        // y-labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                chosenYAxis = d3.select(this).attr("value");
                yLinearScale = yScale(demoData, chosenYAxis, chartHeight);
                yAxis = renderYAxes(yLinearScale, yAxis);
                
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);

                } else if (chosenYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);

                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // update all circle information
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
            });

    // handle any errors
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);