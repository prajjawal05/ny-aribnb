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
    text-align: center;
    font-size: 65px;
    color: white;
    margin: 0px;
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

export { StyledUpperLayout, StyledLowerLayout, StyledContent, StyledVerticalLine, Title };
