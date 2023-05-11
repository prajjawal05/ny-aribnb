import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import data from './data.json';
import { getData } from '../../api';

function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

function MDSPlot({ width = 700, height = 700, filters }) {
    const [data, onDataUpdate] = useState({ nodes: [], links: [] });

    useEffect(() => {
        async function fetchData() {
            const filteredData = await getData(filters, '/mds');
            onDataUpdate(filteredData);
        }
        fetchData();
    }, [filters]);

    useEffect(() => {
        const svg = d3.select('#mdsPlot')
            .attr('width', width)
            .attr('height', height);

        // create the force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-4000))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // create the links
        const links = svg.selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr('stroke', d => 'white')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.abs(d.value) * 10)
            .attr('marker-end', d => d.value >= 0 ? 'url(#arrowhead-positive)' : 'url(#arrowhead-negative)');

        // create the nodes
        const nodes = svg.selectAll('circle')
            .data(data.nodes)
            .enter().append('circle')
            .attr('r', d => d.size)
            .attr('fill', '#fd5c63')
            .style('cursor', 'pointer')
            .call(drag(simulation));

        // add labels to nodes
        const labels = svg.selectAll(null)
            .data(data.nodes)
            .enter()
            .append('text')
            .text(d => d.id)
            .attr('font-size', 16)
            .style('background', 'white')
            .style('fill', 'white')
            .attr('dx', 10)
            .attr('dy', 4);

        // define the drag behavior


        // update the node and link positions on each tick
        simulation.on('tick', () => {
            links.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodes.attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels.attr('x', d => d.x)
                .attr('y', d => d.y);
        });

        return () => {
            simulation.stop();
            svg.selectAll('*').remove();
        };
    }, [data, width, height]);

    return <svg id='mdsPlot'></svg>;
}

export default MDSPlot;