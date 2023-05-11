
import * as d3 from "d3";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getData } from "../../api";
// import { Slider } from 'rsuite';

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

const margin = { top: 70, bottom: 70, left: 120, right: 70 };
const graph_width = 1500, graph_height = 650;

const selectedVariableX = "review rate number";
const selectedVariableY = "price";

const cancellationPolicyMap = { "strict": 4, "moderate": 3, "flexible": 2 };

const xScale = d3.scaleBand()
    .range([0, graph_width - 400])
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


    const graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

    graph.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", graph_width / 2.5)
        .style("fill", "white")
        .attr("y", graph_height - margin.bottom + 30)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("font-weight", "bold")
        .style("font-size", "25px")
        .text("Rating —>");

    graph.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "end")
        .style("fill", "white")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", -80)
        .style("font-weight", "bold")
        .style("font-size", "25px")
        .text("Price —>");

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


    const width = svg.attr("width");
    const height = svg.attr("height");

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("style", "stop-color:#970B13;stop-opacity:1");

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("style", "stop-color:#FCAA8E;stop-opacity:1");

    const legendHeight = 120;
    const legendWidth = 120;
    const funnelHeight = 120;
    const funnelWidth = 70;

    //   const pathData = `M0,${funnelHeight} L${(legendWidth - funnelHeight) / 2},0 L${(legendWidth + funnelHeight) / 2},0 L${legendWidth},${funnelHeight} L0,${funnelHeight}`;
    const pathData = `M${legendWidth / 2 - funnelWidth / 2},${legendHeight - funnelHeight} ` +
        `L${legendWidth / 2 + funnelWidth / 2},${legendHeight - funnelHeight} ` +
        `L${legendWidth / 2 + funnelWidth / 4},${legendHeight} ` +
        `L${legendWidth / 2 - funnelWidth / 4},${legendHeight} ` +
        `L${legendWidth / 2 - funnelWidth / 2},${legendHeight - funnelHeight}`;

    const path = svg.append("path")
        .attr("d", pathData)
        .attr("fill", "#FFCCCB")
        .attr("transform", "translate(" + 1300 + "," + height / 3 + 10 + ")");

    const sizeLegendText = svg.append("text")
        .attr("x", 1350)
        .attr("y", height / 3 - 60)
        .attr("text-anchor", "middle")
        .attr("font-size", "20")
        .attr("font-weight", "bold")
        .text("Number of reviews")
        .style("fill", "rgb(255,255,255");

    const lowerText = svg.append("text")
        .attr("x", 1360)
        .attr("y", height / 2 + 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "16")
        .text(d => d3.min(scatterPlotData, function (d) { return d.review; }))
        .style("fill", "rgb(255,255,255");

    const upperText = svg.append("text")
        .attr("x", 1355)
        .attr("y", height / 3 - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16")
        .text(d => d3.max(scatterPlotData, function (d) { return d.review; }))
        .style("fill", "rgb(255,255,255");

    const legendData = [{ "label": "Strict", "policy": 4 }, { "label": "Strict", "policy": 4 }, { "label": "Moderate", "policy": 3 }, { "label": "Flexible", "policy": 2 }]

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(1270, 0)`);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 20)
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .style("text-shadow", "1px 1px #000000")
        .text("Cancellation Policy");

    legend.selectAll("rect")
        .data(legendData)
        // .filter((d, i) => i !== 0)
        .enter()
        .append("rect")
        .attr("x", 5)
        .attr("y", (d, i) => i * 25 + 50) // adjust y-coordinate
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", (d, i) => {
            if (i == 0) {
                return '#4B5A5E';
            }
            return getColorScale()(d.policy)
        })
        .style("stroke", (d, i) => {
            if (i == 0) {
                return null;
            }
            return "#ffffff"
        })
        .style("stroke-width", (d, i) => {
            if (i == 0) {
                return null;
            }
            return "1px";
        });

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 35)
        .attr("y", (d, i) => i * 25 + 65)
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .style("text-shadow", "1px 1px #000000")
        .text(d => d.label);



    // Add a background rectangle for the legend
    legend.insert("rect", ":first-child")
        .attr("x", -5)
        .attr("y", -5)
        .attr("width", 180)
        .attr("height", (3 * 2 + 1) * 25)
        .attr("fill", "#4B5A5E")
        .style("opacity", 0.87)
        .style("stroke", "#ffffff")
        .style("stroke-width", "2px");

};


const ScatterPlot = ({ filters, filtersResetVersion, onFilterChange = () => undefined }) => {
    const [selectedRating, updateSelections] = useState([]);
    const [data, onDataUpdate] = useState([]);

    const fetchData = useCallback(async () => {
        const filteredData = await getData(filters);
        onDataUpdate(filteredData);
    }, [filters, onDataUpdate])

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        updateSelections([]);
    }, [filtersResetVersion]);

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
        <>
            <div style={{ width: "auto", marginLeft: 20 }}>
                {/* <Slider
        min={1}
        max={370}
        value={56}
        className="custom-slider"
        handleStyle={{
        backgroundColor: "white",
          borderRadius: 10,
          color: 'rgba(127,16,16,1)',
          fontSize: 12,
          width: 160,
          height: 22
        }}
        handleTitle={56}
        // onChange={}
      /> */}
            </div>
            <StyledSVG id="scatterplot" width="1500" height="850" />
        </>
    );
};

export default ScatterPlot;