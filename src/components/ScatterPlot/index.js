
import * as d3 from "d3";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getData } from "../../api";

import StyledSVG from "./style";

const computeJitter = (bandwidth) => {
    return bandwidth / 4 + Math.random() * (0.5 * bandwidth);
}

const getColorScale = () => {
    // const myColors = ["#ffbaba","#ff7b7b","#cb1c1e","#a70000","#7f1010"];

    // const myInterpolator = d3.interpolateRgbBasis(myColors);

    // return d3.scaleSequential().domain([1, 4]).interpolator(myInterpolator);
    return d3.scaleSequential(d3.interpolateReds).domain([1, 5]);
}

const SELECTED_COLOR = 'rgba(109, 6, 189, 0.25)';
const NONE_COLOR = 'rgba(0,0,0,0.0)';
const HIGHLIGHT_COLOR = 'rgba(18, 106, 181,0.45)';

const margin = { top: 70, bottom: 70, left: 70, right: 70 };
const graph_width = 900, graph_height = 650;

const selectedVariableX = "review rate number";
const selectedVariableY = "price";

const cancellationPolicyMap = { "strict": 4, "moderate": 3, "flexible": 2 };

const xScale = d3.scaleBand()
    .range([0, graph_width])
    .domain([1, 2, 3, 4, 5]);

const renderPlot = (selections, onSelect, scatterPlotData, svg, yScale) => {

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
        .attr("cx", data => data.xLabelValue)
        .attr("cy", data => yScale(data.yLabelValue))
        .attr("r", data => { return data.review / 20; })
        .style("opacity", 0.5)
        .attr("fill", data => getColorScale()(data.cancellation_policy));

    svg.selectAll("text")
        .attr('font-size', 16);

    const rectWidth = xScale(2) - xScale(1) - 10;
    const rectHeight = graph_height;//height

    const rectGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    rectGroup.selectAll("rect")
        .data([1, 2, 3, 4, 5])
        .enter()
        .append("rect")
        .attr("x", data => xScale(data))
        .attr("y", 0)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", d => {
            if (!selections.includes(d)) {
                return NONE_COLOR;
            }

            return SELECTED_COLOR;
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function (e, d) {
            d3.select(this)
                .classed("highlighted", true)
                .style("fill", HIGHLIGHT_COLOR);
        }).on("mouseout", function (e, d) {
            const fillColor = selections.includes(d) ? SELECTED_COLOR : NONE_COLOR;
            d3.select(this)
                .classed("highlighted", false)
                .style("fill", fillColor);
        }).on("click", function (e, d) {
            onSelect(d);
        });

};


const ScatterPlot = ({ filters, onFilterChange = () => undefined }) => {
    const [selectedRating, updateSelections] = useState([]);
    const [data, onDataUpdate] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const filteredData = await getData(filters);
            onDataUpdate(filteredData);
        }
        fetchData();
    }, [JSON.stringify(filters)]);


    const handleSelect = useCallback(item => {
        updateSelections(selections => {
            let newSelections = [];
            if (selections.includes(item)) {
                newSelections = selections.filter(slc => slc !== item);
            } else {
                newSelections = [...selections, item];
            }

            onFilterChange(newSelections);
            return newSelections;
        })
    }, [updateSelections, onFilterChange]);

    const scatterPlotData = useMemo(() => data.map(row => ({
        "xLabelValue": xScale(row[selectedVariableX]) + computeJitter(xScale.bandwidth()),
        "yLabelValue": row[selectedVariableY],
        "review": row["number of reviews"],
        "numReviews": row["review rate number"],
        "cancellation_policy": cancellationPolicyMap[row["cancellation_policy"]]
    })), [data]);

    var yScale = d3.scaleLinear().range([graph_height, 0]).domain([
        d3.min(scatterPlotData, function (d) { return d.yLabelValue; }),
        d3.max(scatterPlotData, function (d) { return d.yLabelValue; })]
    ).nice();

    useEffect(() => {
        const svg = d3.select('#scatterplot');
        renderPlot(selectedRating, handleSelect, scatterPlotData, svg, yScale);

        return () => {
            svg.selectAll('*').remove();
        };
    }, [selectedRating, handleSelect, scatterPlotData, yScale]);

    return (
        <StyledSVG id="scatterplot" width="1000" height="850" />
    );
};

export default ScatterPlot;