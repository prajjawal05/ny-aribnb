import data from "./scatterdata.json";
import * as d3 from "d3";
import { useEffect } from "react";

const ScatterPlot = () => {

    useEffect(() => {
        renderPlot();
    });

    return (
        <svg id="scatterplot" width="700" height="700" />
    );
};

var renderPlot = () => {
    const svg = d3.select('#scatterplot');
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };

    var selectedVariableX = "review";
    var selectedVariableY = "price";
    var scatterPlotData = [];

    data.forEach(row => {
        let tempData = { "xLabelValue": row[selectedVariableX], "yLabelValue": row[selectedVariableY] };
        scatterPlotData.push(tempData);
    });


    var xScale = d3.scaleLinear().range([0, 350]).domain([d3.min(scatterPlotData, function (d) { return d.xLabelValue }), d3.max(scatterPlotData, function (d) { return d.xLabelValue; })]).nice();

    var yScale = d3.scaleLinear().range([350, 0]).domain([d3.min(scatterPlotData, function (d) { return d.yLabelValue; }), d3.max(scatterPlotData, function (d) { return d.yLabelValue; })]).nice();


    var xAxis = svg.append("g").classed("xAxis", true).attr("transform", "translate(" + margin.left + "," + (350 + margin.top) + ")").call(d3.axisBottom(xScale));
    var yAxis = svg.append("g").classed("yAxis", true).attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var funYAxis = d3.axisLeft(yScale);
    funYAxis(yAxis);

    // graph.append("text")
    // .attr("class", "x-axis-label")
    // .attr("text-anchor", "end")
    // .attr("x", width / 2.5)
    // .attr("y", height - margin.bottom + 15)
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    // .attr("font-weight", "bold")
    // .text(selectedVariableX.name);

    // graph.append("text")
    // .attr("class", "y-axis-label")
    // .attr("text-anchor", "end")
    // .attr("transform", "rotate(-90)")
    // .attr("y", -70)
    // .attr("font-weight", "bold")
    // .text(selectedVariableY.name);

    var pointGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    pointGroup.selectAll("circle").data(scatterPlotData).enter()
        .append("circle")
        .attr("cx", data => xScale(data.xLabelValue))
        .attr("cy", data => yScale(data.yLabelValue))
        .attr("r", 2)
        .attr("fill", "#ff5959");
};

export default ScatterPlot;