import styled from "styled-components";
import { ElementsRow } from "./ElementsRow";
import { ScrubberContainer } from "./Scrubber";

export const PropsContainer = styled.div.withConfig({ displayName: "props-container" })`
  ${ScrubberContainer} {
    border: solid 1px transparent;
    outline: solid 1px transparent;
    outline-offset: -2px;

    :hover {
      border-color: var(--color-border);
    }

    :focus-within {
      border-color: var(--color-focus);
      outline-color: var(--color-focus);
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
