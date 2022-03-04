import styled from "styled-components";
import { ElementsRow } from "./ElementsRow";
import { ScrubberContainer } from "./Scrubber";
import { SelectContainer, SelectValue } from "./Select";

export const PropsContainer = styled.div.withConfig({ displayName: "props-container" })`
  ${ScrubberContainer}, ${SelectContainer} {
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

  ${SelectContainer} {
    :hover {
      ${SelectValue} {
        width: 100%;
      }
    }
  }

  ${ElementsRow} {
    ${ScrubberContainer} {
      grid-column-end: span 11;
    }

    ${ScrubberContainer}.second-in-row {
      grid-column-start: 13;
    }

    .clip-content {
      grid-column-end: span 28;
    }

    .vertical-constraint, .horizontal-constraint {
      grid-column-end: span 13;
    }

    .vertical-constraint {
      grid-column-start: 15;
    }

    .font-size {
      grid-column-end: span 9;
      grid-column-start: 15;
    }

    .text-align {
      grid-column-end: span 13;
    }

    .font-weight {
      grid-column-end: span 13;
    }
  }
`;
