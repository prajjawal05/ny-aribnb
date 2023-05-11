import * as d3 from 'd3';
import { useEffect } from 'react';

import data from '../ScatterPlot/scatterdata.json';

import StyledBurst from './style';

const WIDTH = 500, HEIGHT = 500;
const RADIUS = Math.min(WIDTH, HEIGHT) / 2;
const partition = d3.partition().size([2 * Math.PI, RADIUS]);

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const _map_boro_code = {
    '1': 'Manhattan',
    '2': 'Bronx',
    '3': 'Brooklyn',
    '4': 'Queens',
    '5': 'Staten Island',
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

const getColorScale = () => {
    return d3.scaleSequential(d3.interpolateReds)
        .domain([0, 7]);
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

const renderSunburst = () => {
    const svg = d3
        .select("#acbltBurst")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .append("g")
        .attr("transform", `translate(${WIDTH / 2},${HEIGHT / 2})`);

    const svgPosRect = svg.node().getBoundingClientRect();
    const g = svg.selectAll("g").data(partition(root).descendants());

    g.enter()
        .append("g")
        .attr("class", "node")
        .append("path")
        .attr("d", arc)
        .style("fill", (d) => {
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
            const fillColor = 'red';

            const descendants = d.descendants();

            svg.selectAll('path')
                .filter((nd) => nd === d || descendants.includes(nd))
                .attr("stroke-width", 2)
                .classed("highlighted", true)
                .style('fill', fillColor);
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
                    let fillColor = getColorScale()(x.depth);
                    if (x.depth === 0) {
                        fillColor = 'black';
                    }

                    return fillColor;
                });
        })
        .on("click", function (e, d) {
            console.log(d);
        });
}

const SunBurst = () => {
    useEffect(() => {
        renderSunburst();
    }, []);

    return (
        <StyledBurst>
            <svg id="acbltBurst" width="600" height="600" />
        </StyledBurst>
    )
};

export default SunBurst;

