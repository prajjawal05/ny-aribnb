import * as d3 from 'd3';
import { useCallback, useEffect, useState } from 'react';

import data from '../ScatterPlot/scatterdata.json';

import StyledBurst from './style';

const WIDTH = 500, HEIGHT = 500;
const RADIUS = Math.min(WIDTH, HEIGHT) / 2;
const partition = d3.partition().size([2 * Math.PI, RADIUS]);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const addAngles = (parent, children) => {
    let start = parent.prev;
    for (const child of children) {
        child.prev = start;
        start += (child.value / parent.value) * (parent.next - parent.prev)
        child.next = start;
    }
}

const level_map = {
    0: d => ({
        name: d.price_range,
        property: d.price_range
    }),
    1: d => ({
        name: d.instant_bookable ? "Instant bookable" : "Not instant bookable",
        property: d.instant_bookable
    }),

    2: d => ({
        name: d.cancellation_policy + " cancellation policy",
        property: d.cancellation_policy
    })
}

const getLevelData = (d, lvl = 0) => {
    if (lvl === 3) {
        return [];
    }

    const groupedData = d.reduce(
        (acc, d) => {
            const { property, name } = level_map[lvl](d);
            if (!acc[property]) {
                acc[property] = {
                    name,
                    property,
                    value: 0,
                    children: []
                };
            }

            acc[property].value = acc[property].value + 1;
            acc[property].children.push(d);
            return acc;
        }, {});


    return Object.values(groupedData).map(grp => {
        return { ...grp, children: getLevelData(grp.children, lvl + 1) };
    });
}

function getGraphData() {
    const children = getLevelData(data);
    const graphDataV2 = {
        name: "root",
        value: children.reduce((sum, child) => {
            sum += child.value;
            return sum;
        }, 0),
        children,
        prev: 0,
        next: 2 * Math.PI,
    };
    addAngles(graphDataV2, children);

    for (const child of children) {
        const childrenl2 = child.children;
        addAngles(child, childrenl2, child.prev);

        for (const childl2 of childrenl2) {
            const childrenl3 = childl2.children;
            addAngles(childl2, childrenl3, childl2.prev);
        }
    }
    return graphDataV2;
}

const arc = d3
    .arc()
    .startAngle((d) => {
        return d.data.prev;
    })
    .padAngle(d => 0.001)
    .endAngle((d) => d.data.next)
    .innerRadius((d) => {
        return d.y0;
    })
    .outerRadius((d) => d.y1 - getRandomArbitrary(2, 10));

const HOVER_COLOR = '#126ab5';

function getNewSelection(prevSelections, rgn) {
    let finalSelection = [];
    for (const item of prevSelections) {
        if (item[0] !== rgn[0]) {
            finalSelection.push(item);
            continue;
        }
        if (item[1] === null && rgn[1] !== null) {
            continue;
        }
        if (item[1] !== null && rgn[1] === null) {
            continue;
        }
        if (item[1] !== rgn[1]) {
            finalSelection.push(item);
            continue;
        }
        if (item[2] === null && rgn[2] !== null) {
            continue;
        }
        if (item[2] !== null && rgn[2] === null) {
            continue;
        }
        if (item[2] !== rgn[2]) {
            finalSelection.push(item);
            continue;
        }
    }

    let found = false;
    for (const item of prevSelections) {
        if (rgn[0] === item[0] && item[1] === rgn[1] && item[2] === rgn[2]) {
            found = true;
            break;
        }
    }

    if (!found) {
        finalSelection.push(rgn);
    }

    return finalSelection;
}

const graphDataV2 = getGraphData();

const root = d3.hierarchy(graphDataV2)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

var tooltip = d3.select("body")
    .append("div")
    .attr("id", "sunId")
    .classed("sunId", true)
    .style("opacity", 0)
    .style("position", "absolute")
    .style('color', "white")
// .style('width', '200px');

const getColorScale = () => {
    const myColors = ["#ffbaba", "#ff7b7b", "f22929", "#cb1c1e", "#a70000", "#7f1010",];

    const myInterpolator = d3.interpolateRgbBasis(myColors);

    return d3.scaleSequential().domain([0, 5]).interpolator(myInterpolator);
}

const renderSunburst = (svg, selections, onSelect) => {

    const svgPosRect = svg.node().getBoundingClientRect();
    const g = svg.selectAll("g").data(partition(root).descendants());

    g.enter()
        .append("g")
        .attr("class", "node")
        .append("path")
        .attr("d", arc)
        .style("fill", (d) => {
            if (isRegionSelected(d, selections)) {
                return getColorScale()(d.depth + 3);
            }
            return getColorScale()(d.depth);
        })
        .style("opacity", (d) => {
            if (d.depth === 0) {
                return 0;
            }
            return 1;
        })
        .on("mouseover", function (e, d) {
            this.parentNode.appendChild(this);
            tooltip.style("opacity", 1);
            tooltip.html(`${d.data.name} (${d.data.value})`);

            tooltip.style("left", svgPosRect.right + WIDTH / 3 + "px")
                .style("top", svgPosRect.top - HEIGHT / 2 + "px");

            const descendants = d.descendants();

            svg.selectAll('path')
                .filter((nd) => nd === d || descendants.includes(nd))
                .attr("stroke-width", 2)
                .classed("highlighted", true)
                .style('fill', d => {
                    return HOVER_COLOR;
                });
        })
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0);

            const descendants = d.descendants();

            svg.selectAll('path')
                .filter((nd) => nd === d || descendants.includes(nd))
                .classed("highlighted", false)
                .attr("transform", null)
                .style("stroke-width", 1)
                .style("fill", x => {
                    if (isRegionSelected(x, selections)) {
                        return getColorScale()(x.depth + 3);
                    }
                    return getColorScale()(x.depth);
                });
        })
        .on("click", function (e, d) {
            onSelect(parseDataForSelection(d));
        });
}

const isRegionSelected = (d, selections) => {
    const formatedDt = parseDataForSelection(d);
    for (const item of selections) {
        if (item[0] === formatedDt[0] && item[1] === formatedDt[1] && item[2] === formatedDt[2]) {
            return true;
        }
        if (item[0] === formatedDt[0] && item[1] === formatedDt[1] && item[2] === null) {
            return true;
        }
        if (item[0] === formatedDt[0] && item[1] === null) {
            return true;
        }
    }

    return false;
}

const parseDataForSelection = d => {
    let data = { 0: null, 1: null, 2: null };
    let node = d;

    for (let i = d.depth; i > 0; i--) {
        data[i - 1] = node.data.property;
        node = node.parent;
    }

    return data;
}


const SunBurst = ({ onSelect = select => undefined }) => {
    const [selections, updateSelections] = useState([]);

    const handleSelect = useCallback(rgn => {
        updateSelections(prevSelections => {
            if (rgn[0] === null && rgn[1] === null && rgn[2] === null) {
                onSelect([]);
                return [];
            }

            const newSelection = getNewSelection(prevSelections, rgn);
            onSelect(newSelection);
            console.log(newSelection);
            return newSelection;
        })
    }, []);

    useEffect(() => {
        const svg = d3
            .select("#acbltBurst")
            .append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .append("g")
            .attr("transform", `translate(${WIDTH / 2},${HEIGHT / 2})`);

        renderSunburst(svg, selections, handleSelect);

        return () => {
            svg.selectAll('*').remove();
        };
    }, [selections, handleSelect]);

    return (
        <StyledBurst>
            <svg id="acbltBurst" width="600" height="600" />
        </StyledBurst>
    )
};

export default SunBurst;


