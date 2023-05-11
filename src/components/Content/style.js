import styled from "styled-components";

const StyledUpperLayout = styled.div`
    display: flex;
    border: 1.5px solid rgba(255,255,255,0.63);
    justify-content: space-around;
`;

const StyledLowerLayout = styled.div`
    display: flex;
    border-left: 1px solid rgba(255,255,255,0.63);
    border-right: 1px solid rgba(255,255,255,0.63);
    border-bottom: 1px solid rgba(255,255,255,0.63);
    justify-content: space-around;
`;

const Title = styled.p`
    font-family: trebuchet ms, sans-serif;
    text-align: center;
    font-size: 65px;
    color: white;
    margin: 0px;
    background-image: linear-gradient( 179deg,  rgba(0,0,0,1) 9.2%, rgba(127,16,16,1) 93.9% );
    border-left: 1px solid rgba(255,255,255,0.63);
    border-right: 1px solid rgba(255,255,255,0.63);
    border-top: 1px solid rgba(255,255,255,0.63);
`;

const GraphTitle = styled.p`
    text-align: center;
    font-size: 40px;
    color: white;
    margin: 0px;
    margin-top: 5px;
`;

const StyledPlot = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const StyledVerticalLine = styled.div`
    border-left: 1.5px solid rgba(255,255,255,0.63);
    display: inline-block;
    margin: 0 10px;
`;

export { StyledUpperLayout, StyledLowerLayout, StyledContent, StyledVerticalLine, Title, GraphTitle, StyledPlot };
