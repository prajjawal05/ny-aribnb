import * as d3 from "d3";
import { useEffect, useState } from "react";

import StyledMap from "./style";

import data from './boundaries.json';


const Map = ({ onSelect }) => {
    const [selectedRegions, updateSelectedRegions] = useState([])

    useEffect(() => {
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
    }, []);

        
    return (
        <StyledMap>
            <svg id="nycmap" width="700" height="700"/>
        </StyledMap>
    );
};

export default Map;