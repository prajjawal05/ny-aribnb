import { useState, useCallback } from "react";

import Map from "../../containers/Map";
import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import SunBurst from "../SunBurst";
import MDSPlot from "../MDSPlot";

import dataSet from './scatterdata.json';

import { StyledUpperLayout, StyledLowerLayout, StyledContent } from "./style";

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
    }, []);

    const onScatterPlotChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SCATTER_PLOT, filter);
    }, []);

    return (
        <StyledUpperLayout>
            <Map
                {...rest}
                onFilterChange={onMapItemsChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.MAP]]}
            />
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
    }, []);

    const onSunBurstChange = useCallback(filter => {
        onFilterChange(FILTER_TYPES.SUN_BURST, filter);
    }, []);

    return (
        <StyledLowerLayout>
            <MDSPlot />
            <BarGraph
                {...rest}
                onFilterChange={onBarGraphChange}
                version={versions[FILTER_INDEX[FILTER_TYPES.BAR_GRAPH]]} />
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
        <UpperLayout {...props} />
        <LowerLayout {...props} />
    </StyledContent>
);

const Content = () => {
    const [data, updateData] = useState(dataSet);
    const [filter, updateFilters] = useState(DEFAULT_FILTERS);
    const [versions, updateVersions] = useState([0, 0, 0, 0]);

    const onDataUpdate = (filter, type) => {
        console.log(filter);

        updateVersions(prevVersion => {
            const newVersions = [...prevVersion];
            Object.values(FILTER_TYPES).forEach(filterType => {
                if (filterType !== type) {
                    newVersions[FILTER_INDEX[filterType]]++;
                }
            })
            return newVersions;
        })
    }

    const onFilterChange = useCallback((type, value) => {
        updateFilters(prevFilter => {
            const newFilter = { ...prevFilter, [type]: value };
            onDataUpdate(newFilter, type);

            return newFilter;
        })
    }, []);

    return <Layout
        data={data}
        versions={versions}
        onFilterChange={onFilterChange}
    />
}



export default Content;