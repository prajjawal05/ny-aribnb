import data from "./scatterdata.json";
import * as d3 from "d3";
import { useEffect } from "react";

const ScatterPlot = () => {

    useEffect(() => {
        renderPlot();
    });

    return (
        <svg id="scatterplot" width="1000" height="850" />
    );
};

const computeJitter = (bandwidth) => {
    return bandwidth / 3 + Math.random() * (0.5 * bandwidth);
}

const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateReds).domain([0, 4]);
}

var renderPlot = () => {
    const svg = d3.select('#scatterplot');
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };
    var graph_width = 900, graph_height = 650;
    // svg.call(brush);

    var selectedVariableX = "review rate number";
    var selectedVariableY = "price";

    var cancellationPolicyMap = { "strict": 4, "moderate": 3, "flexible": 2 };

    const scatterPlotData = data.map(row => ({
        "xLabelValue": row[selectedVariableX],
        "yLabelValue": row[selectedVariableY],
        "review": row["number of reviews"],
        "numReviews": row["review rate number"],
        "cancellation_policy": cancellationPolicyMap[row["cancellation_policy"]]
    }));

    var xScale = d3.scaleBand()
        .range([0, graph_width])
        .domain([1, 2, 3, 4, 5]);

    var yScale = d3.scaleLinear().range([graph_height, 0]).domain([
        d3.min(scatterPlotData, function (d) { return d.yLabelValue; }),
        d3.max(scatterPlotData, function (d) { return d.yLabelValue; })]
    ).nice();

    var xAxis = svg.append("g")
        .classed("xAxis", true)
        .attr("transform", "translate(" + margin.left + "," + (graph_height + margin.top) + ")")
        .style("color", "white")
        .style("font-size", "16px");

    var yAxis = svg.append("g")
        .classed("yAxis", true)
        .style("color", "white")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.axisLeft(yScale)(yAxis);
    d3.axisBottom(xScale)(xAxis);

    var pointGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    pointGroup.selectAll("circle")
        .data(scatterPlotData)
        .enter()
        .append("circle")
        .attr("cx", data => xScale(data.xLabelValue) + computeJitter(xScale.bandwidth()))
        .attr("cy", data => yScale(data.yLabelValue))
        .attr("r", data => { return data.review / 20; })
        .style("opacity", 0.5)
        .attr("fill", data => getColorScale()(data.cancellation_policy));

    svg.selectAll("text")
        .attr('font-size', 16);

    const rectWidth = xScale(2) - xScale(1);
    const rectHeight = graph_height;//height

    const rectGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    rectGroup.selectAll("rect")
        .data(scatterPlotData)
        .enter()
        .append("rect")
        .attr("x", data => xScale(data.xLabelValue))
        .attr("y", 0)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", "rgba(0,0,0,0.002)")
        .attr("stroke", "white")
        .attr("stroke-width", 0.7);

};

export default ScatterPlot;