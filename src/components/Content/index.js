import Map from "../../containers/Map";
import BarGraph from "../BarGraph";
import ScatterPlot from "../ScatterPlot";
import Pcp from "../PcpGraph";

import { StyledUpperLayout, StyledLowerLayout, StyledContent } from "./style";


const UpperLayout = () => (
    <StyledUpperLayout>
        <Map />
        <ScatterPlot />
    </StyledUpperLayout>
);

const LowerLayout = () => (
    <StyledLowerLayout>
        <BarGraph />
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