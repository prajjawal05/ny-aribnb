import data from "../ScatterPlot/scatterdata.json";
import * as d3 from "d3";
import { useEffect } from "react";

const BarGraph = () => {
    useEffect(() => {
        renderGraph();
    });

    return (
        <svg id="bar-graph" width="600" height="600" />
    );
};

var createList = (data, selectedVariable) => {
    var freqMap = [];
    var ranges = ["2003-07", "2008-12", "2013-17", "2018-22"]
    var yearRange = {
        "2003-07": { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
        "2008-12": { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
        "2013-17": { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 },
        "2018-22": { "Entire_home_apt": 0, "Hotel_room": 0, "Private_room": 0, "Shared_room": 0 }
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
    for (let range of ranges) {
        freqMap.push({ "key": range, "Entire_home_apt": yearRange[range].Entire_home_apt, "Hotel_room": yearRange[range].Hotel_room, "Private_room": yearRange[range].Private_room, "Shared_room": yearRange[range].Shared_room })
    }
    // console.log(freqMap);
    return freqMap
}

var renderGraph = () => {

    const svg = d3.select('#bar-graph');
    const graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");
    const margin = { top: 70, bottom: 70, left: 70, right: 70 };
    const width = 500, height = 500;
    const selectedVariable = { "name": "year_range" };
    const graphData = createList(data, selectedVariable);


    const xLabel = selectedVariable.name;
    const yLabel = "Frequency";
    const xScale = d3.scaleBand().range([0, width]).padding(0.2);
    const yScale = d3.scaleLinear().range([height, 0]).nice();
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

    const stack = d3.stack()
        .keys(["Private_room", "Entire_home_apt", "Hotel_room", "Shared_room"]);
    const stackedData = stack(graphData);
    // console.log(stackedData);

    const barGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const color = d3.scaleOrdinal()
        .domain(["Private_room", "Entire_home_apt", "Hotel_room", "Shared_room"])
        .range([d3.interpolateReds(1), d3.interpolateReds(0.75), d3.interpolateReds(0.5), d3.interpolateReds(0.25)]);

    barGroup.selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => { console.log(d.key, color(d.key)); return color(d.key); })
        .selectAll("rect")
        .data(d => { return d; })
        .enter().append("rect")
        .attr("x", d => { return xScale(d.data.key); })
        .attr("y", d => { return yScale(d[1]); })
        .attr("width", xScale.bandwidth())
        .attr("height", d => { return yScale(d[0]) - yScale(d[1]); });
};

export default BarGraph;