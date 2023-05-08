import styled from "styled-components";

const StyledMap = styled.div`
    .borough {
        fill: #ccc;
        stroke: #333;
    }

    .highlighted {
        stroke: black;
        stroke-width: 2px;
        cursor: pointer;
        z-index: 10;
    }
`;

export default StyledMap;