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

var createMap = (data, selectedVariable) => {
    var freqMap = {}
    data.forEach(row => {
        if (!freqMap[row[selectedVariable.name]]) {
            freqMap[row[selectedVariable.name]]=0
        }
        freqMap[row[selectedVariable.name]]++;
    });
    return freqMap
}

var renderGraph = () => {

    const svg = d3.select('#bar-graph');
    var graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };
    var width = 350, height = 350;
    var selectedVariable = {"name":"roomType"};
    var freqMap = createMap(data, selectedVariable), graphData = [];

    for(const [key,value] of Object.entries(freqMap)) {
        graphData.push({"key":key,"value":value});
    }

    var xScale = null, yScale = null;

    var xLabel = null, yLabel = null;

    xLabel = selectedVariable.name;
    yLabel = "Frequency";
    xScale = d3.scaleBand().range([0,width]).padding(0.2);
    yScale = d3.scaleLinear().range([height,0]).nice();
    xScale.domain(graphData.map(function(d) { return d.key; }));
    yScale.domain([0, 20 + d3.max(graphData, function(d) { return d.value; })]);

    var xAxis = svg.append("g").classed("xAxis",true).attr("transform", "translate(" + margin.left + "," + (height+margin.top) + ")").call(d3.axisBottom(xScale));
    var yAxis = svg.append("g").classed("yAxis",true).attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    var funYAxis=d3.axisLeft(yScale);
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
    
    var barGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    barGroup.selectAll("rect").data(graphData).enter()
    .append("rect")
    .attr("width", xScale.bandwidth())
    .attr("height", data => height - yScale(data.value))
    .attr("x", data => xScale(data.key))
    .attr("y", data => yScale(data.value))
    .attr("fill", "#f95959")

    barGroup.selectAll("text").data(graphData).enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("width", xScale.bandwidth())
    .attr("height", data => height - yScale(data.value))
    .attr("x", data => xScale(data.key) + xScale.bandwidth()/2)
    .attr("y", data => yScale(data.value) - 15)
    .text(data => data.value)
};

export default BarGraph;