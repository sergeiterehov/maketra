import styled from "styled-components";
import { ColorPicker } from "./components/ColorPicker";
import { ElementsRow } from "./components/ElementsRow";
import { IconButton } from "./components/IconButton";
import { PanelTitle } from "./components/PanelTitle";
import { ScrubberContainer } from "./components/Scrubber";
import { SelectContainer, SelectValue } from "./components/Select";

export const PropsContainer = styled.div.withConfig({
  displayName: "props-container",
})`
  ${ScrubberContainer}, ${SelectContainer}, ${ColorPicker} {
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

  ${IconButton} {
    --color-icon: currentColor;
  }

  ${ElementsRow} {
    ${PanelTitle} {
      grid-column-start: 2;
      grid-column-end: span 20;
    }

    ${ScrubberContainer} {
      grid-column-end: span 11;
    }

    ${ScrubberContainer}.second-in-row {
      grid-column-start: 13;
    }

    .clip-content {
      grid-column-end: span 28;
    }

    .vertical-constraint,
    .horizontal-constraint {
      grid-column-end: span 13;
    }

    .vertical-constraint {
      grid-column-start: 15;
    }

    .opacity {
      grid-column-end: span 7;
      grid-column-start: 17;
    }

    .blend-mode {
      grid-column-end: span 15;
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

    .fill-paint {
      grid-column-end: span 18;
    }

    &[data-disabled] .fill-paint {
      color: var(--color-fg-disabled)
    }

    .fill-paint-actions {
      grid-column-start: 21;
      grid-column-end: span 8;
    }
  }
`;
