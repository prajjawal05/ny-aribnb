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
    var roomType = { "Entire home/apt": { "instant_count": 0, "non_instant_count": 0 }, "Hotel room": { "instant_count": 0, "non_instant_count": 0 }, "Private room": { "instant_count": 0, "non_instant_count": 0 }, "Shared room": { "instant_count": 0, "non_instant_count": 0 } };
    data.forEach(row => {
        if (row['instant_bookable']) {
            roomType[row[selectedVariable.name]].instant_count++;
        }
        else {
            roomType[row[selectedVariable.name]].non_instant_count++;
        }
    });
    console.log(roomType);
    freqMap.push({ "key": "Entire home/apt", "instant_count": roomType["Entire home/apt"].instant_count, "non_instant_count": roomType["Entire home/apt"].non_instant_count });
    freqMap.push({ "key": "Hotel room", "instant_count": roomType["Hotel room"].instant_count, "non_instant_count": roomType["Hotel room"].non_instant_count });
    freqMap.push({ "key": "Private room", "instant_count": roomType["Private room"].instant_count, "non_instant_count": roomType["Private room"].non_instant_count });
    freqMap.push({ "key": "Shared room", "instant_count": roomType["Shared room"].instant_count, "non_instant_count": roomType["Shared room"].non_instant_count });
    return freqMap
}

var renderGraph = () => {

    const svg = d3.select('#bar-graph');
    var graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };
    var width = 350, height = 350;
    var selectedVariable = { "name": "room type" };
    var graphData = createList(data, selectedVariable);

    var xScale = null, yScale = null;

    var xLabel = null, yLabel = null;

    xLabel = selectedVariable.name;
    yLabel = "Frequency";
    xScale = d3.scaleBand().range([0, width]).padding(0.2);
    yScale = d3.scaleLinear().range([height, 0]).nice();
    xScale.domain(graphData.map(function (d) { return d.key; }));
    yScale.domain([0, 25]);

    var xAxis = svg.append("g").classed("xAxis", true).attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")").call(d3.axisBottom(xScale));
    var yAxis = svg.append("g").classed("yAxis", true).attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var funYAxis = d3.axisLeft(yScale);
    funYAxis(yAxis);

    graph.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2.5)
        .attr("y", height - margin.bottom + 15)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("font-weight", "bold")
        .text(xLabel);

    graph.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("font-weight", "bold")
        .text(yLabel);

    graph.append("text")
        .attr("class", "top-axis-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", -120)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("font-weight", "bold")
        .text("Bar Graph of " + selectedVariable.name);

    var stack = d3.stack().keys(["instant_count", "non_instant_count"]);
    var stackedData = stack(graphData);
    console.log(stackedData);

    var barGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var color = d3.scaleOrdinal().range(["#22a7f0", "#d21404"]);

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