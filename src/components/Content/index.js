import Map from "../../containers/Map";
import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import SunBurst from "../SunBurst";
import MDSPlot from "../MDSPlot";

import { StyledUpperLayout, StyledLowerLayout, StyledContent } from "./style";


const UpperLayout = () => (
    <StyledUpperLayout>
        <Map />
        <ScatterPlot />
    </StyledUpperLayout>
);

const LowerLayout = () => (
    <StyledLowerLayout>
        <MDSPlot />
        <BarGraph />
        <SunBurst />
    </StyledLowerLayout>
);

const Content = () => (
    <StyledContent>
        <UpperLayout />
        <LowerLayout />
    </StyledContent>
);



export default Content;