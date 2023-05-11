import * as d3 from "d3";
import { useEffect, useState, useCallback, useMemo } from "react";
import ReactDomServer from 'react-dom/server';
import { ThreeCircles } from 'react-loader-spinner'

import { getData } from "../../api";


import StyledMap from "./style";
import boundaryData from './boundaries.json';

const borroughs = ['Staten Island', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx'];
const mapData = {
    ...boundaryData,
    features: boundaryData.features.filter(({ properties: { boro_name } }) => borroughs.includes(boro_name)),
}

const SELECTED_COLOR = '#126ab5';
// const HOVERED_SELECTED_COLOR = '#C2B280';
const HOVERED_SELECTED_COLOR = '#e89a4a';
const EMPTY_COLOR = '#676970';

const getBoroughDataFromMap = d => d.properties.boro_code;


const assignOrderForFreqMap = boroFreq => {
    const entries = Object.entries(boroFreq);
    entries.sort((a, b) => a[1] - b[1]);
    for (let i = 1; i <= entries.length; i++) {
        entries[i - 1][1] = i;
    }
    const sortedObj = Object.fromEntries(entries);

    return sortedObj;
}

const getColorScale = () => {
    const myColors = ["#ffbaba", "#ff7b7b", "#cb1c1e", "#a70000", "#7f1010"];

    const myInterpolator = d3.interpolateRgbBasis(myColors);

    return d3.scaleSequential().domain([0, 5]).interpolator(myInterpolator);
}

const isRegionSelected = (d, selectedRgns) => {
    const rgn = getBoroughDataFromMap(d);
    return selectedRgns.includes(rgn);
}

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    // .style("height", "100px")
    // .style("width", "100px")
    .style("color", "black")
    .style("background-color", "white")
    .style("font-size", "16px");

const renderMapSvg = (svg, boroFreq, selectedRgns, onSelect) => {
    const colorMap = assignOrderForFreqMap(boroFreq);

    const projection = d3.geoAlbers()
        .center([0, 40.66])
        .rotate([74, 0])
        .parallels([38, 42])
        .scale(90000)
        .translate([1000 / 2, 950 / 2]);

    const path = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            if (!boroFreq[getBoroughDataFromMap(d)]) {
                return EMPTY_COLOR;
            }
            if (isRegionSelected(d, selectedRgns)) {
                return HOVERED_SELECTED_COLOR;
            }
            return getColorScale()(colorMap[getBoroughDataFromMap(d)]);
        })
        .classed("disabledArea", d => !boroFreq[getBoroughDataFromMap(d)])
        .classed("selected", d => isRegionSelected(d, selectedRgns))
        .on("mouseover", function (event, d) {
            this.parentNode.appendChild(this);

            tooltip.style("opacity", 1);
            tooltip.html(
                ReactDomServer.renderToString(
                    <div style={{
                        width: "150px",
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
                    }}>
                        <div style={{
                            marginBottom: "10px",
                            fontWeight: "bold",
                            fontSize: "18px",
                            textShadow: "1px 1px #000000",
                        }}>
                            {d.properties.boro_name}
                        </div>
                        <div style={{
                            textAlign: "center",
                            fontSize: "19px",
                        }}>
                            {!!boroFreq[getBoroughDataFromMap(d)] && (boroFreq[getBoroughDataFromMap(d)])}
                        </div>
                    </div>
                )
            );

            tooltip.style("left", event.x + 40 + "px")
                .style("top", event.y + 40 + "px");

            if (!boroFreq[getBoroughDataFromMap(d)]) {
                d3.select(this)
                    .style("fill", EMPTY_COLOR);

                return;
            }

            d3.select(this)
                .classed("highlighted", true)
                // .attr("transform", "scale(1.2) translate(-35, -35)")
                .style("fill", SELECTED_COLOR);

        })
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0);

            if (!boroFreq[getBoroughDataFromMap(d)]) {
                d3.select(this)
                    .style("fill", EMPTY_COLOR);

                return;
            }

            const fillColor = isRegionSelected(d, selectedRgns) ? HOVERED_SELECTED_COLOR : getColorScale()(colorMap[getBoroughDataFromMap(d)]);
            d3.select(this)
                .classed("highlighted", false)
                .attr("transform", null)
                .style("fill", fillColor);
        })
        .on("click", function (e, d) {
            if (!boroFreq[getBoroughDataFromMap(d)]) {
                return;
            }

            onSelect(getBoroughDataFromMap(d));
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
        .attr("style", "stop-color:#7f1010;stop-opacity:1");

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("style", "stop-color:#ff7b7b;stop-opacity:1");

    //   const myColors = ["#ffbaba", "#ff7b7b", "#cb1c1e", "#a70000", "#7f1010"];
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

    const legendPath = svg.append("path")
        .attr("d", pathData)
        .attr("fill", "url(#gradient)")
        .attr("transform", "translate(" + 30 + "," + height / 3.5 + ")");;

    const sizeLegendText = svg.append("text")
        .attr("x", 100)
        .attr("y", height / 3.5 - 70)
        .attr("text-anchor", "middle")
        .attr("font-size", "20")
        .attr("font-weight", "bold")
        .text("Number of Airbnbs")
        .style("fill", "rgb(255,255,255");

    const lowerText = svg.append("text")
        .attr("x", 85)
        .attr("y", height / 2 - 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "16")
        .text(d => d3.min(Object.values(boroFreq)))
        .style("fill", "rgb(255,255,255");

    const upperText = svg.append("text")
        .attr("x", 85)
        .attr("y", height / 3 - 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "16")
        .text(d => d3.max(Object.values(boroFreq)))
        .style("fill", "rgb(255,255,255");
};

const Map = ({ filters, filtersResetVersion, onFilterChange = () => undefined }) => {
    const [selectedRegions, updateSelectedRegions] = useState([]);
    const [data, onDataUpdate] = useState([]);

    const fetchData = useCallback(async () => {
        const filteredData = await getData(filters);
        onDataUpdate(filteredData);
    }, [filters, onDataUpdate])

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        updateSelectedRegions([]);
    }, [filtersResetVersion]);

    const handleSelect = useCallback(rgn => {
        updateSelectedRegions(selectedRgns => {
            let newRgn = [...selectedRgns];
            if (newRgn.includes(rgn)) {
                newRgn = newRgn.filter(r => r !== rgn);
            } else {
                newRgn.push(rgn);
            }
            onFilterChange(newRgn);
            return newRgn;
        });
    }, [updateSelectedRegions, onFilterChange]);

    const boroFreq = useMemo(() => data.reduce(
        (acc, d) => {
            if (!acc[d.boro_code]) {
                acc[d.boro_code] = 0;
            }

            acc[d.boro_code] = acc[d.boro_code] + 1;
            return acc;
        }, {}), [data]);

    useEffect(() => {
        const svg = d3.select('#nycmap');
        renderMapSvg(svg, boroFreq, selectedRegions, handleSelect);

        return () => {
            svg.selectAll('*').remove();
        };
    }, [selectedRegions, handleSelect, boroFreq]);

    return (
        <StyledMap>
            <svg id="nycmap" width="1000" height="850" />
        </StyledMap>
    );
};

export default Map;