import * as d3 from "d3";
import { useEffect, useState, useCallback } from "react";

import StyledMap from "./style";

import boundaryData from './boundaries.json';
import data from '../../components/ScatterPlot/scatterdata.json';

const borroughs = ['Staten Island', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx'];
const mapData = {
    ...boundaryData,
    features: boundaryData.features.filter(({ properties: { boro_name } }) => borroughs.includes(boro_name)),
}

const SELECTED_COLOR = '#C9CC3F';
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
        .scale(50000)
        .translate([600 / 2, 600 / 2]);

    const path = d3.geoPath()
        .projection(projection);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

    const svg = d3.select('#nycmap');
    const svgPosRect = svg.node().getBoundingClientRect();

    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            if (isRegionSelected(d, selectedRgns)) {
                return SELECTED_COLOR;
            }
            return getColorScale()(boroFreq[getBoroughDataFromMap(d)]);
        })
        .on("mouseover", function (event, d) {
            this.parentNode.appendChild(this);

            tooltip.style("opacity", 1);
            tooltip.html(d.properties.boro_name);

            tooltip.style("left", svgPosRect.right - 30 + "px")
                .style("top", svgPosRect.top + 50 + "px");
            const fillColor = isRegionSelected(d, selectedRgns) ? HOVERED_SELECTED_COLOR : getHighlightedColorScale()(boroFreq[getBoroughDataFromMap(d)]);

            d3.select(this)
                .classed("highlighted", true)
                // .attr("transform", "scale(1.2) translate(-35, -35)")
                .attr("stroke-width", 2)
                .style("fill", fillColor);

        })
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0);
            const fillColor = isRegionSelected(d, selectedRgns) ? SELECTED_COLOR : getColorScale()(boroFreq[getBoroughDataFromMap(d)]);
            d3.select(this)
                .classed("highlighted", false)
                .attr("transform", null)
                .style("stroke-width", 1) // remove the highlighted class
                .style("fill", fillColor);
        })
        .on("click", function (e, d) {
            onSelect(getBoroughDataFromMap(d));
        });
};

const Map = ({ onSelect = () => undefined }) => {
    const [selectedRegions, updateSelectedRegions] = useState([])

    const handleSelect = useCallback(rgn => {
        updateSelectedRegions(selectedRgn => {
            const newRgn = [...selectedRgn, rgn];
            onSelect(newRgn);

            console.log(newRgn);
            return newRgn;
        });
    });

    useEffect(() => {
        renderMapSvg(selectedRegions, handleSelect);
    }, [selectedRegions, handleSelect]);

    return (
        <StyledMap>
            <svg id="nycmap" width="600" height="600" />
        </StyledMap>
    );
};

export default Map;