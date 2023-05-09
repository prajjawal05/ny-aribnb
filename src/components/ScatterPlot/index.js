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

const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateReds).domain([0, 4]);
}

var brushed = ({ selection }) => {
    // console.log(selection);
}

var renderPlot = () => {
    const svg = d3.select('#scatterplot');
    var margin = { top: 70, bottom: 70, left: 70, right: 70 };

    const brush = d3.brush()
        .extent([[margin.left, margin.top], [margin.left + 350, margin.top + 350]])
        .on("start brush end", brushed);

    svg.call(brush);

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

    var xScale = d3.scaleLinear()
        .range([0, 350])
        .domain([0, 5])
        .nice();

    var yScale = d3.scaleLinear().range([350, 0]).domain([
        d3.min(scatterPlotData, function (d) { return d.yLabelValue; }),
        d3.max(scatterPlotData, function (d) { return d.yLabelValue; })]
    ).nice();

    var xAxis = svg.append("g")
        .classed("xAxis", true)
        .attr("transform", "translate(" + margin.left + "," + (350 + margin.top) + ")")
        .style("color", "white")
        .call(d3.axisBottom(xScale));

    var yAxis = svg.append("g")
        .classed("yAxis", true)
        .style("color", "white")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var funYAxis = d3.axisLeft(yScale);
    funYAxis(yAxis);

    // svg.append("text")
    //     .attr("class", "x-axis-label")
    //     .attr("text-anchor", "end")
    //     // .attr("x", 700 / 2.5)
    //     // .attr("y", 400 - margin.bottom + 15)
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .attr("font-weight", "bold")
    //     .style("color", "white")
    //     .text(selectedVariableX);

    // svg.append("text")
    //     .attr("class", "y-axis-label")
    //     .attr("text-anchor", "end")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", -10)
    //     .attr("font-weight", "bold")
    //     .style("color", "white")
    //     .text(selectedVariableY);

    var pointGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    pointGroup.selectAll("circle")
        .data(scatterPlotData)
        .enter()
        .append("circle")
        .attr("cx", data => xScale(data.xLabelValue))
        .attr("cy", data => yScale(data.yLabelValue))
        .attr("r", data => {
            return data.review / 20;
        })
        .style("opacity", 0.5)
        .attr("fill", data => getColorScale()(data.cancellation_policy));
};

export default ScatterPlot;