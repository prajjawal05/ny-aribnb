import * as d3 from "d3";
import { useEffect, useState } from "react";

import StyledMap from "./style";

import allData from './boundaries.json';

const borroughs = ['Staten Island', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx'];
const data = {
    ...allData,
    features: allData.features.filter(({ properties: { boro_name } }) => borroughs.includes(boro_name)),
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
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "borough");
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