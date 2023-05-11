import styled from "styled-components";

const StyledMap = styled.div`
    .borough {
        fill: #ccc;
        stroke: #333;
    }

    .highlighted {
        stroke: black;
        stroke-width: 3px;
        cursor: pointer;
        z-index: 10;
    }

    .selected {
        stroke: black;
        stroke-width: 2px;
    }

    .disabledArea {
        cursor: not-allowed;
    }
`;

export default StyledMap;