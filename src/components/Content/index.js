import Map from "../../containers/Map";
// import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import Pcp from "../PcpGraph";
import SunBurst from "../SunBurst";

import { StyledUpperLayout, StyledLowerLayout, StyledContent } from "./style";


const UpperLayout = () => (
    <StyledUpperLayout>
        <Map />
        <ScatterPlot />
    </StyledUpperLayout>
);

const LowerLayout = () => (
    <StyledLowerLayout>
        <SunBurst />
        <Pcp />
    </StyledLowerLayout>
);

const Content = () => (
    <StyledContent>
        <UpperLayout />
        <LowerLayout />
    </StyledContent>
);



export default Content;