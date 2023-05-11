import * as d3 from "d3";
import { useEffect, useState, useCallback } from "react";

import StyledMap from "./style";
import ReactDomServer from 'react-dom/server';

import boundaryData from './boundaries.json';
import data from '../../components/ScatterPlot/scatterdata.json';

const borroughs = ['Staten Island', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx'];
const mapData = {
    ...boundaryData,
    features: boundaryData.features.filter(({ properties: { boro_name } }) => borroughs.includes(boro_name)),
}

const SELECTED_COLOR = '#318CE7';
const HOVERED_SELECTED_COLOR = '#C2B280';

const getBoroughDataFromMap = d => d.properties.boro_code;

const boroFreq = data.reduce(
    (acc, d) => {
        if (!acc[d.boro_code]) {
            acc[d.boro_code] = 0;
        }

        acc[d.boro_code] = acc[d.boro_code] + 1;
        return acc;
    }, {});

const getHighlightedColorScale = () => {
    return d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(Object.values(boroFreq))]);
}

const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(Object.values(boroFreq))]);
}

const isRegionSelected = (d, selectedRgns) => {
    const rgn = getBoroughDataFromMap(d);
    return selectedRgns.includes(rgn);
}

const renderMapSvg = (selectedRgns, onSelect) => {
    const projection = d3.geoAlbers()
        .center([0, 40.66])
        .rotate([74, 0])
        .parallels([38, 42])
        .scale(90000)
        .translate([1000 / 2, 950 / 2]);

    const path = d3.geoPath()
        .projection(projection);

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

    const svg = d3.select('#nycmap');

    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            if (isRegionSelected(d, selectedRgns)) {
                return HOVERED_SELECTED_COLOR;
            }
            return getColorScale()(boroFreq[getBoroughDataFromMap(d)]);
        })
        .classed("selected", d => isRegionSelected(d, selectedRgns))
        .on("mouseover", function (event, d) {
            this.parentNode.appendChild(this);

            tooltip.style("opacity", 1);
            tooltip.html(
                ReactDomServer.renderToString(
                    <div style={{ width: "100px", height: "50px", display: "flex", justifyContent: "center" }}>
                        {d.properties.boro_name}
                        <br />
                        ({boroFreq[getBoroughDataFromMap(d)]})
                    </div>
                )
            );

            tooltip.style("left", event.x + 40 + "px")
                .style("top", event.y + 40 + "px");

            const fillColor = SELECTED_COLOR;

            d3.select(this)
                .classed("highlighted", true)
                // .attr("transform", "scale(1.2) translate(-35, -35)")
                .style("fill", fillColor);

        })
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0);
            const fillColor = isRegionSelected(d, selectedRgns) ? HOVERED_SELECTED_COLOR : getColorScale()(boroFreq[getBoroughDataFromMap(d)]);
            d3.select(this)
                .classed("highlighted", false)
                .attr("transform", null)
                .style("fill", fillColor);
        })
        .on("click", function (e, d) {
            onSelect(getBoroughDataFromMap(d));
        });
};

const Map = ({ onSelect = () => undefined }) => {
    const [selectedRegions, updateSelectedRegions] = useState([]);

    const handleSelect = useCallback(rgn => {
        updateSelectedRegions(selectedRgns => {
            let newRgn = [...selectedRgns];
            if (newRgn.includes(rgn)) {
                newRgn = newRgn.filter(r => r !== rgn);
            } else {
                newRgn.push(rgn);
            }
            onSelect(newRgn);
            return newRgn;
        });
    });

    useEffect(() => {
        renderMapSvg(selectedRegions, handleSelect);
    }, [selectedRegions, handleSelect]);

    return (
        <StyledMap>
            <svg id="nycmap" width="1000" height="850" />
        </StyledMap>
    );
};

export default Map;