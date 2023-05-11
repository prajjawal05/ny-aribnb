import { useState, useCallback } from "react";
import Map from "../../containers/Map";
import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import SunBurst from "../SunBurst";
import MDSPlot from "../MDSPlot";

import dataSet from './scatterdata.json';

import { StyledUpperLayout, StyledLowerLayout, StyledContent, StyledVerticalLine, Title } from "./style";

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

const UpperLayout = ({ onFilterChange, versions, ...rest }) => {
    const onMapItemsChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.MAP, filter);
    }, [onFilterChange]);

    const onScatterPlotChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SCATTER_PLOT, filter);
    }, [onFilterChange]);

    return (
        <StyledUpperLayout>
            <Map
                {...rest}
                onFilterChange={onMapItemsChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.MAP]]}
            />
            <StyledVerticalLine />
            <ScatterPlot
                {...rest}
                onFilterChange={onScatterPlotChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.SCATTER_PLOT]]}
            />
        </StyledUpperLayout>
    )
};

const LowerLayout = ({ onFilterChange, versions, ...rest }) => {
    const onBarGraphChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.BAR_GRAPH, filter);
    }, [onFilterChange]);

    const onSunBurstChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SUN_BURST, filter);
    }, [onFilterChange]);

    return (
        <StyledLowerLayout>
            <MDSPlot />
            <StyledVerticalLine />
            <BarGraph
                {...rest}
                onFilterChange={onBarGraphChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.BAR_GRAPH]]} />
            <StyledVerticalLine />
            <SunBurst
                {...rest}
                onFilterChange={onSunBurstChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.SUN_BURST]]}
            />
        </StyledLowerLayout>
    )
};

const Layout = props => (
    <StyledContent>
        <Title>Title</Title>
        <UpperLayout {...props} />
        <LowerLayout {...props} />
    </StyledContent>
);

const Content = () => {
    const [data, updateData] = useState(dataSet);
    const [_, updateFilters] = useState(DEFAULT_FILTERS);
    const [versions, updateVersions] = useState([0, 0, 0, 0]);

    const onDataUpdate = useCallback(async (filter, type) => {
        const data = await new Promise((resolve, reject) => fetch('http://localhost:5668/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        })
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            }));

        updateData(data);
        updateVersions(prevVersion => {
            const newVersions = [...prevVersion];
            Object.values(FILTER_TYPES).forEach(filterType => {
                if (filterType !== type) {
                    newVersions[FILTER_INDEX[filterType]]++;
                }
            })
            return newVersions;
        });
    }, []);

    const onFilterChange = useCallback((type, value) => {
        updateFilters(prevFilter => {
            const newFilter = { ...prevFilter, [type]: value };
            onDataUpdate(newFilter, type);

            return newFilter;
        })
    }, [onDataUpdate]);

    return <Layout
        data={data}
        versions={versions}
        onFilterChange={onFilterChange}
    />
}



export default Content;