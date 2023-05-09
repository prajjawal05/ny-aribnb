import { useEffect } from 'react';
import * as d3 from "d3";
import data from '../ScatterPlot/scatterdata.json';

function get_current_position(attribute, x_props, mid_drag_position) {
    var pos = mid_drag_position[attribute];
    // console.log(pos);
    return pos == null ? x_props(attribute) : pos;
}


function get_color_generator(category_count, scheme = d3.schemeCategory10) {
    const labels = [];
    for (let c = 0; c < category_count; c++) {
        labels.push(c);
    }
    return d3.scaleOrdinal().domain(labels).range(scheme);
}

function apply_transition(group) {
    return group.transition().duration(500);
}

// Returns the path for a given data point.
function draw_path(row, attributes, x_props, y_props_collection, mid_drag_position) {
    const lineGenerator = d3.line().x(function (d) { return d[0]; }).y(function (d) { return d[1]; });
    const pathData = attributes.map(function (attribute) {
        return [
            get_current_position(attribute, x_props, mid_drag_position),
            y_props_collection[attribute](row[attribute])
        ];
    });

    return lineGenerator(pathData);
}

function brushed(e, attributes, y_props_collection, data_path_group, brush_extents) {
    for (var i = 0; i < attributes.length; ++i) {
        if (e.target == y_props_collection[attributes[i]].brush) {
            const a = y_props_collection[attributes[i]]
            if (e.selection[0] == e.selection[1]) {
                brush_extents[i] = [0, 0]
            }
            else {
                brush_extents[i] = e.selection.map(
                    y_props_collection[attributes[i]].invert,
                    y_props_collection[attributes[i]]
                )
            }

        }
    }

    data_path_group.style("display", function (d) {
        return attributes.every(function (p, i) {
            if (brush_extents[i][0] == 0 && brush_extents[i][1] == 0) {
                return true;
            }
            return brush_extents[i][1] <= d[p] && d[p] <= brush_extents[i][0];
        }) ? null : "none";
    });
}

const renderPcp = () => {
    const attributes = ['price', 'number of reviews', 'review rate number'];
    const brush_extents = attributes.map(() => [0, 0]);
    var mid_drag_position = {};
    const svg = d3.select('#pcp');

    const WIDTH = 400, HEIGHT = 400;
    const margin = {
        left: 40,
        top: 20
    };

    var graph_obj = svg.append('g')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);


    // Create axis
    var x_props = d3.scalePoint().domain(attributes).range([0, WIDTH]);
    var y_props_collection = {}
    attributes.forEach(item => {
        y_props_collection[item] = d3.scaleLinear()
            .domain(d3.extent(data, row => parseFloat(row[item])))
            .range([HEIGHT, 0], 1);
    });

    const shadow = graph_obj.append("g")
        .attr("class", "shadow-group-item")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", row => draw_path(row, attributes, x_props, y_props_collection, mid_drag_position))
        .attr('stroke', "grey")
        .attr('fill', "none")
        .attr('opacity', 0.3);

    const colors = get_color_generator(3);
    const data_path_group = graph_obj.append("g")
        .attr("class", "data-path-group-item")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr('fill', "none")
        .attr('opacity', 0.7)
        .attr('stroke', function (d) {
            return colors(1)
        })
        .attr("d", row => draw_path(row, attributes, x_props, y_props_collection, mid_drag_position))

    var data_lines = graph_obj.selectAll(".attribute-group-item")
        .data(attributes)
        .enter()
        .append("g")
        .attr("transform", attribute => `translate(${x_props(attribute)})`)
        .attr("class", "attribute-group-item")

    // .call(d3.drag()
    //     .subject(function (attribute) { return { x_props: x_props(attribute) }; })
    //     .on("start", function (attribute) {
    //         mid_drag_position[attribute] = x_props(attribute);
    //         shadow.attr("visibility", "hidden");
    //     })
    //     .on("drag", function (e, attribute) {
    //         mid_drag_position[attribute] = Math.min(WIDTH, Math.max(0, e.x));
    //         console.log(mid_drag_position[attribute]);
    //         data_path_group.attr("d", row => draw_path(row, attributes, x_props, y_props_collection, mid_drag_position));
    //         attributes.sort(function (a, b) { return get_current_position(a, x_props, mid_drag_position) - get_current_position(b, x_props, mid_drag_position); });
    //         x_props.domain(attributes)
    //         data_lines.attr("transform", attribute => `translate(${get_current_position(attribute, x_props, mid_drag_position)})`)
    //     })
    //     .on("end", function (attribute) {
    //         delete mid_drag_position[attribute];
    //         apply_transition(d3.select(this)).attr("transform", `translate(${x_props(attribute)})`);
    //         apply_transition(data_path_group).attr("d", row => draw_path(row, attributes, x_props, y_props_collection, mid_drag_position));

    //         shadow.attr("d", row => draw_path(row, attributes, x_props, y_props_collection, mid_drag_position)).transition()
    //             .delay(500)
    //             .duration(0)
    //             .attr("visibility", null);

    //     }))

    data_lines.append("g")
        .attr("class", "axis-group-item")
        .style("cursor", "move")
        .each(function (attribute) {
            d3.select(this)
                .call(d3.axisLeft()
                    .scale(y_props_collection[attribute]))
                .style("color", "white");
        })
        .append("text")
        .attr("y", -margin.top / 2)
        .style("text-anchor", "middle")
        .style("stroke", "white")
        .text(attribute => attribute);

    data_lines.selectAll("g")
        .select('path')
        .style("stroke", "white");

    data_lines.append("g")
        .attr("class", "brush")
        .each(function (attribute) {
            d3.select(this).call(y_props_collection[attribute].brush =
                d3.brushY()
                    .extent([[-8, 0], [8, HEIGHT]])
                    .on("start", e => brushed(e, attributes, y_props_collection, data_path_group, brush_extents))
                    .on("brush", e => brushed(e, attributes, y_props_collection, data_path_group, brush_extents)));
        })
        .selectAll("rect")
        .attr("x", -20)
        .attr("width", 100);
}

const Pcp = () => {

    useEffect(() => {
        renderPcp();
    }, [])

    return (
        <svg id="pcp" width="500" height="500" />
    );
}

export default Pcp;