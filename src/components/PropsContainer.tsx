import styled from "styled-components";
import { ElementsRow } from "./ElementsRow";
import { ScrubberContainer } from "./Scrubber";

export const PropsContainer = styled.div.withConfig({ displayName: "props-container" })`
  ${ScrubberContainer} {
    border: solid 1px transparent;
    outline: solid 1px transparent;
    outline-offset: -2px;

    :hover {
      border-color: #DDD;
    }

    :focus-within {
      border-color: #00F;
      outline-color: #00F;
    }
  }

  ${ElementsRow} {
    ${ScrubberContainer} {
      grid-column-end: span 11;
    }

    ${ScrubberContainer}.second-in-row {
      grid-column-start: 13;
    }
  }
`;
