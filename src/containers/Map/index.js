import * as d3 from "d3";
import { useEffect, useState } from "react";

import StyledMap from "./style";

import boundaryData from './boundaries.json';
import data from '../../components/ScatterPlot/scatterdata.json';

const borroughs = ['Staten Island', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx'];
const mapData = {
    ...boundaryData,
    features: boundaryData.features.filter(({ properties: { boro_name } }) => borroughs.includes(boro_name)),
}

const boroFreq = data.reduce(
    (acc, d) => {
        if (!acc[d.boro_code]) {
            acc[d.boro_code] = 0;
        }

        acc[d.boro_code] = acc[d.boro_code] + 1;
        return acc;
    }, {});

console.log(boroFreq);

const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(Object.values(boroFreq))]);
}

const renderMapSvg = () => {
    const projection = d3.geoAlbers()
        .center([0, 40.66])
        .rotate([74, 0])
        .parallels([38, 42])
        .scale(50000)
        .translate([500 / 2, 500 / 2]);

    const path = d3.geoPath()
        .projection(projection);

    const svg = d3.select('#nycmap');

    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            console.log(boroFreq[d.properties.boro_code]);
            return getColorScale()(boroFreq[d.properties.boro_code]);
        });
};

const Map = ({ onSelect }) => {
    const [selectedRegions, updateSelectedRegions] = useState([])

    useEffect(() => {
        renderMapSvg();
    }, []);

    return (
        <StyledMap>
            <svg id="nycmap" width="500" height="500" />
        </StyledMap>
    );
};

export default Map;