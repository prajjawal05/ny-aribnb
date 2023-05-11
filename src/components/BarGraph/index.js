import data from "../ScatterPlot/scatterdata.json";
import * as d3 from "d3";
import { useEffect, useState, useCallback } from "react";

import ReactDomServer from 'react-dom/server';


import StyledSVG from "./style";


const margin = { top: 70, bottom: 70, left: 70, right: 70 };
const width = 500, height = 500;

const xLabel = "Year Range";
const yLabel = "Frequency";
const xScale = d3.scaleBand().range([0, width]).padding(0.2);
const yScale = d3.scaleLinear().range([height, 0]).nice();

const ROOM_TYPES = ["Private_room", "Entire_home_apt", "Hotel_room", "Shared_room"];

const makeAxes = (svg) => {
    svg.append("g")
        .classed("xAxis", true)
        .style("color", "white")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .classed("yAxis", true)
        .style("color", "white")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yScale))

    const graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

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
            yearRange[row[selectedVariable]].Hotel_room++;
        }
        else if (row['room type'] === "Private room") {
            yearRange[row[selectedVariable]].Private_room++;
        }
        else if (row['room type'] === "Shared room") {
            yearRange[row[selectedVariable]].Shared_room++;
        }
        else {
            yearRange[row[selectedVariable]].Entire_home_apt++;
        }
    });
    for (let range of ranges) {
        freqMap.push({ "key": range, "Entire_home_apt": yearRange[range].Entire_home_apt, "Hotel_room": yearRange[range].Hotel_room, "Private_room": yearRange[range].Private_room, "Shared_room": yearRange[range].Shared_room })
    }
    return freqMap
}

const isSelected = (selections, item) => {
    for (const rgn of selections) {
        if (item.key == rgn.key && item.roomType == rgn.roomType) {
            return true;
        }
    }

    return false;
}

var tooltip = d3.select("body")
    .append("div")
    .attr("id", "barGraph")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    // .style("height", "100px")
    // .style("width", "100px")
    .style("color", "black")
    .style("background-color", "white")
    .style("font-size", "16px");

var renderGraph = (svg, selections, onSelect) => {
    const attribute = "year_range";
    const graphData = createList(data, attribute);

    xScale.domain(graphData.map(function (d) { return d.key; }));
    yScale.domain([0, d3.max(graphData, function (d) { return d.Entire_home_apt + d.Hotel_room + d.Shared_room + d.Private_room; })]);
    makeAxes(svg);

    const stackedData = d3.stack()
        .keys(ROOM_TYPES)(graphData)
        .map(roomWise => {
            let newData = roomWise.map(({ data, ...rest }) => ({
                ...rest,
                data: {
                    ...data,
                    roomType: roomWise.key
                }
            }))
            newData.key = roomWise.key;
            return newData;
        });

    const barGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const myColors = ["#ff7b7b","#cb1c1e","#a70000","#7f1010"];
    const color = d3.scaleOrdinal()
        .domain(ROOM_TYPES)
        .range(myColors);

    const colorSelected = d3.scaleOrdinal()
        .domain(ROOM_TYPES)
        .range([d3.interpolateGreens(1), d3.interpolateGreens(0.75), d3.interpolateGreens(0.5), d3.interpolateGreens(0.25)]);

    const barWidth = xScale.bandwidth();
    barGroup.selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => { return color(d.key); })
        .selectAll("rect")
        .data(d => { return d; })
        .enter().append("rect")
        .attr("x", d => { return xScale(d.data.key); })
        .attr("y", d => { return yScale(d[1]); })
        .attr("width", barWidth)
        .attr("height", d => {
            const height = (yScale(d[0]) - yScale(d[1]));
            if (height > 5) {
                return height - 2;
            }

            return height;
        })
        .style("fill", function (d) {
            if (isSelected(selections, d.data)) {
                return colorSelected(d.data.roomType);
            }
            return color(d.data.roomType);
        })
        .on("mouseover", function (e, d) {
            console.log(d.data);
            tooltip.style("opacity", 1);
            // tooltip.html(
            //     ReactDomServer.renderToString(
            //         <div style={{ width: "150px", height: "auto", display: "flex", justifyContent: "center" }}>
            //             {d.data.roomType}
            //             <br />
            //             {d.data[d.data.roomType]} ({((d.data[d.data.roomType] * 100 / ROOM_TYPES.map(roomType => d.data[roomType]).reduce((x,y)=>x+y,0)).toFixed(2))}%)
            //         </div>
            //     )
            // );
            tooltip.html(
                ReactDomServer.renderToString(
                    <div style={{
                        width: "200px",
                        height: "auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "10px",
                        backgroundColor: "#333333",
                        color: "#ffffff",
                        borderRadius: "5px",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)",
                        fontSize: "14px",
                        fontFamily: "Arial, sans-serif",
                        lineHeight: "1.4em",
                        textTransform: "uppercase",
                    }}>
                        <div style={{
                            marginBottom: "10px",
                            fontWeight: "bold",
                            fontSize: "18px",
                            textShadow: "1px 1px #000000",
                        }}>
                            {d.data.roomType}
                        </div>
                        <div style={{
                            textAlign: "center",
                            fontSize: "19px",
                        }}>
                            {d.data[d.data.roomType]} ({(
                                (d.data[d.data.roomType] * 100 / ROOM_TYPES.map(roomType => d.data[roomType]).reduce((x, y) => x + y, 0)).toFixed(2)
                            )}%)
                        </div>
                    </div>
                )
            );
            
            

            tooltip.style("left", e.x + 40 + "px")
                .style("top", e.y + 40 + "px");

            d3.select(this)
                .classed('highlighted', true)
                .attr("width", barWidth * 1.25)
                .attr("x", d => { return xScale(d.data.key) - barWidth / 8; })
                .style('fill', '#318CE7');
        }).on("mouseout", function (e, d) {
            tooltip.style("opacity", 0);
            d3.select(this)
                .classed('highlighted', false)
                .attr("width", barWidth)
                .attr("x", d => { return xScale(d.data.key); })
                .style('fill', isSelected(selections, d.data) ? colorSelected(d.data.roomType) : color(d.data.roomType));;
        }).on("click", function (e, d) {
            onSelect(d.data);
        });
};

const BarGraph = ({ onSelect = () => undefined }) => {
    const [selections, updateSelections] = useState([]);

    const handleSelect = useCallback(rgn => {
        updateSelections(selectedRgns => {
            let newRgn = [...selectedRgns];

            if (isSelected(newRgn, rgn)) {
                newRgn = newRgn.filter(item => item.key != rgn.key || item.roomType != rgn.roomType);
            } else {
                newRgn = [...newRgn, { ...rgn }];
            }

            onSelect(newRgn);
            return newRgn;
        });
    });

    useEffect(() => {
        const svg = d3.select('#bar-graph');
        renderGraph(svg, selections, handleSelect);

        return () => {
            svg.selectAll('*').remove();
        };
    }, [selections, handleSelect]);

    return (
        <StyledSVG id="bar-graph" width="600" height="600" />
    );
};

export default BarGraph;