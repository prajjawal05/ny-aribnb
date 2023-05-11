import { useState, useCallback, useMemo } from "react";
import Map from "../../containers/Map";
import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import SunBurst from "../SunBurst";
import MDSPlot from "../MDSPlot";
import { RedoOutlined } from '@ant-design/icons';

import dataSet from './scatterdata.json';

import { StyledUpperLayout, StyledLowerLayout, StyledContent, StyledVerticalLine, Title, GraphTitle, StyledPlot } from "./style";
import { removeKeyFromObject } from "../../utils";
import { randomBates } from "d3";

const FILTER_TYPES = {
    MAP: "MAP",
    SCATTER_PLOT: "SCATTER_PLOT",
    BAR_GRAPH: "BAR_GRAPH",
    SUN_BURST: "SUNBURST"
}

const DEFAULT_FILTERS = {
    [FILTER_TYPES.MAP]: [],
    [FILTER_TYPES.SCATTER_PLOT]: [],
    [FILTER_TYPES.BAR_GRAPH]: [],
    [FILTER_TYPES.SUN_BURST]: [],
}

const FILTER_INDEX = {
    [FILTER_TYPES.MAP]: 0,
    [FILTER_TYPES.SCATTER_PLOT]: 1,
    [FILTER_TYPES.BAR_GRAPH]: 2,
    [FILTER_TYPES.SUN_BURST]: 3,
}

const UpperLayout = ({ onFilterChange, filters, ...rest }) => {
    const onMapItemsChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.MAP, filter);
    }, [onFilterChange]);

    const onScatterPlotChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SCATTER_PLOT, filter);
    }, [onFilterChange]);


    const filterForMap = useMemo(
        () => removeKeyFromObject(filters, FILTER_TYPES.MAP), [filters]
    );
    const filterForScatterplot = useMemo(
        () => removeKeyFromObject(filters, FILTER_TYPES.SCATTER_PLOT), [filters]
    );

    return (
        <StyledUpperLayout>
            <StyledPlot>
                <GraphTitle>Map</GraphTitle>
                <Map
                    {...rest}
                    onFilterChange={onMapItemsChange}
                    filters={filterForMap}
                />
            </StyledPlot>
            <StyledVerticalLine />
            <StyledPlot>
                <GraphTitle>Scatter Plot</GraphTitle>
                <ScatterPlot
                    {...rest}
                    onFilterChange={onScatterPlotChange}
                    filters={filterForScatterplot}
                />
            </StyledPlot>
        </StyledUpperLayout>
    )
};

const LowerLayout = ({ onFilterChange, filters, ...rest }) => {
    const onBarGraphChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.BAR_GRAPH, filter);
    }, [onFilterChange]);

    const onSunBurstChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SUN_BURST, filter);
    }, [onFilterChange]);

    const filterForSunburst = useMemo(
        () => removeKeyFromObject(filters, FILTER_TYPES.SUN_BURST), [filters]
    );
    const filterForBarGraph = useMemo(
        () => removeKeyFromObject(filters, FILTER_TYPES.BAR_GRAPH), [filters]
    );
    return (
        <StyledLowerLayout>
            <StyledPlot>
                <GraphTitle>MDS Plot</GraphTitle>
                <MDSPlot filters={filters} />
            </StyledPlot>
            <StyledVerticalLine />
            <StyledPlot>
                <GraphTitle>Stacked Bar Graph</GraphTitle>
                <BarGraph
                    {...rest}
                    onFilterChange={onBarGraphChange}
                    filters={filterForBarGraph}
                />
            </StyledPlot>
            <StyledVerticalLine />
            <StyledPlot>
                <GraphTitle>Sun Burst</GraphTitle>
                <SunBurst
                    {...rest}
                    onFilterChange={onSunBurstChange}
                    filters={filterForSunburst}
                />
            </StyledPlot>
        </StyledLowerLayout>
    )
};

const Layout = ({ onResetFilters, ...props }) => (
    <StyledContent>
        <Title>NYC Airbnb: A Data-Driven Stay
            <button title="Refresh"
                style={{
                    background: 'rgba(48,49,52,0.59)',
                    border: '2px solid grey',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '50px',
                    padding: '11px 8px 11px 8px',
                    margin: '0 0 0 50px',
                    float: 'right'
                }}
                onClick={onResetFilters}
            >
                <RedoOutlined style={{ color: 'white' }} />
            </button>
        </Title>
        <UpperLayout {...props} />
        <LowerLayout {...props} />
    </StyledContent>
);

const Content = () => {
    const [filters, updateFilters] = useState(DEFAULT_FILTERS);
    const [filtersResetVersion, updateFiltersResetVersion] = useState(0);

    const onFilterChange = useCallback((type, value) => {
        updateFilters(prevFilter => {
            return { ...prevFilter, [type]: value };
        })
    }, []);

    const onResetFilters = useCallback(() => {
        updateFiltersResetVersion(prevVersion => prevVersion + 1);
        updateFilters(DEFAULT_FILTERS);
    }, [updateFilters]);

    return <Layout
        filters={filters}
        filtersResetVersion={filtersResetVersion}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
    />
}



export default Content;