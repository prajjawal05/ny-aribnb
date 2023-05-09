import data from "../ScatterPlot/scatterdata.json";
import * as d3 from "d3";
import { useEffect } from "react";

const BarGraph = () => {
    useEffect(() => {
        renderGraph();
    });

    return (
        <svg id="bar-graph" width="500" height="500" />
    );
};

var createList = (data, selectedVariable) => {
    var freqMap = [];
    var ranges = ["2003-07" , "2008-12", "2013-17", "2018-22"]
    var yearRange = { "2003-07" : { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
    "2008-12" : { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
    "2013-17" : { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
    "2018-22" : { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 }
    };
    data.forEach(row => {
        if (row['room type'] === "Hotel room") {
            yearRange[row[selectedVariable.name]].Hotel_room++;
        }
        else if (row['room type'] === "Private room") {
            yearRange[row[selectedVariable.name]].Private_room++;
        }
        else if (row['room type'] === "Shared room") {
            yearRange[row[selectedVariable.name]].Shared_room++;
        }
        else {
            yearRange[row[selectedVariable.name]].Entire_home_apt++;
        }
    });
    // console.log(yearRange);
    for(let range of ranges) {
        freqMap.push({"key": range, "Entire_home_apt": yearRange[range].Entire_home_apt, "Hotel_room": yearRange[range].Hotel_room, "Private_room": yearRange[range].Private_room, "Shared_room": yearRange[range].Shared_room })
    }
    // console.log(freqMap);
    return freqMap
}

var renderGraph = () => {

    const svg = d3.select('#bar-graph');
    var graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };
    var width = 350, height = 350;
    var selectedVariable = { "name": "year_range" };
    var graphData = createList(data, selectedVariable);

    var xScale = null, yScale = null;

    var xLabel = null, yLabel = null;

    xLabel = selectedVariable.name;
    yLabel = "Frequency";
    xScale = d3.scaleBand().range([0, width]).padding(0.2);
    yScale = d3.scaleLinear().range([height, 0]).nice();
    xScale.domain(graphData.map(function (d) { return d.key; }));
    yScale.domain([0, 700]);

    var xAxis = svg.append("g").classed("xAxis", true).style("color", "white").attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")").call(d3.axisBottom(xScale));
    var yAxis = svg.append("g").classed("yAxis", true).style("color", "white").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var funYAxis = d3.axisLeft(yScale);
    funYAxis(yAxis);

    graph.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2.5)
        .style("color", "white")
        .attr("y", height - margin.bottom + 15)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("font-weight", "bold")
        .text(xLabel);

    graph.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "end")
        .style("color", "white")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("font-weight", "bold")
        .text(yLabel);

    // graph.append("text")
    //     .attr("class", "top-axis-label")
    //     .attr("text-anchor", "end")
    //     .attr("x", width / 2)
    //     .attr("y", -120)
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .attr("font-weight", "bold")
    //     .text("Bar Graph of " + selectedVariable.name);

    var stack = d3.stack().keys([ "Private_room", "Entire_home_apt", "Hotel_room", "Shared_room"]);
    var stackedData = stack(graphData);
    // console.log(stackedData);

    var barGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var color = d3.scaleOrdinal().range(["#22a7f0", "#d21404", "f23e1c", "a4c2b5"]);

    barGroup.selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => { return color(d.key); })
        .selectAll("rect")
        .data(d => { return d; })
        .enter().append("rect")
        .attr("x", d => { return xScale(d.data.key); })
        .attr("y", d => { return yScale(d[1]); })
        .attr("width", xScale.bandwidth())
        .attr("height", d => { return yScale(d[0]) - yScale(d[1]); });

    // barGroup.selectAll("rect").data(graphData).enter()
    // .append("rect")
    // .attr("width", xScale.bandwidth())
    // .attr("height", data => height - yScale(data.value))
    // .attr("x", data => xScale(data.key))
    // .attr("y", data => yScale(data.value))
    // .attr("fill", data => { return color(data.key); });

    // barGroup.selectAll("text").data(graphData).enter()
    // .append("text")
    // .attr("text-anchor", "middle")
    // .attr("width", xScale.bandwidth())
    // .attr("height", data => height - yScale(data.value))
    // .attr("x", data => xScale(data.key) + xScale.bandwidth()/2)
    // .attr("y", data => yScale(data.value) - 15)
    // .text(data => data.value)
};

export default BarGraph;