import * as d3 from 'd3';
import { useEffect } from 'react';
import data from '../ScatterPlot/scatterdata.json';

const WIDTH = 500, HEIGHT = 500;

const partition = d3.partition().size([2 * Math.PI, Math.min(WIDTH, HEIGHT) / 2]);

const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1);


// Todo: combine functions for all the three level of data using recursion and a level depth

const getThirdLevel = d => {
    const groupedByCancellable = d.reduce(
        (acc, d) => {
            if (!acc[d.cancellation_policy]) {
                acc[d.cancellation_policy] = {
                    name: d.cancellation_policy,
                    value: 0,
                };
            }

            acc[d.cancellation_policy].value = acc[d.cancellation_policy].value + 1;
            return acc;
        }, {});

    return Object.values(groupedByCancellable);
}

const getSecondLevelData = d => {
    const groupedByInstantBookable = d.reduce(
        (acc, d) => {
            if (!acc[d.instant_bookable]) {
                acc[d.instant_bookable] = {
                    name: d.instant_bookable,
                    value: 0,
                    children: []
                };
            }

            acc[d.instant_bookable].value = acc[d.instant_bookable].value + 1;
            acc[d.instant_bookable].children.push(d);
            return acc;
        }, {});

    return Object.values(groupedByInstantBookable).map(grp => ({ ...grp, children: getThirdLevel(grp.children) }));
}

const getFirstLevelData = d => {
    const groupedByBorough = d.reduce(
        (acc, d) => {
            if (!acc[d.boro_code]) {
                acc[d.boro_code] = {
                    name: d.boro_code,
                    value: 0,
                    children: []
                };
            }

            acc[d.boro_code].value = acc[d.boro_code].value + 1;
            acc[d.boro_code].children.push(d);
            return acc;
        }, {});

    return Object.values(groupedByBorough).map(grp => ({ ...grp, children: getSecondLevelData(grp.children) }));
}

const graphData = {
    name: "borroughs",
    children: getFirstLevelData(data)
}

const root = d3.hierarchy(graphData)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);


console.log(graphData);

const SunBurst = () => {
    useEffect(() => {
        const svg = d3
            .select("#acbltBurst")
            .append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .append("g")
            .attr("transform", `translate(${WIDTH / 2},${HEIGHT / 2})`);

        const g = svg.selectAll("g").data(partition(root).descendants());

        g.enter()
            .append("g")
            .attr("class", "node")
            .append("path")
            .attr("d", arc)
            .style("fill", (d) => {
                console.log(d);
            });
    }, []);

    return (
        <div>
            <svg id="acbltBurst" width="600" height="600" />
        </div>
    )
};

export default SunBurst;