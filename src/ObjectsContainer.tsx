import styled from "styled-components";
import { NodeTreeRow } from "./components/NodeTreeRow";

export const ObjectsContainer = styled.div.withConfig({
  displayName: "ObjectsContainer",
})`
  ${NodeTreeRow} {
    .indent-expander {
      visibility: hidden;
    }

    .visibility {
      visibility: hidden;
    }

    &:hover .visibility {
      visibility: visible;
    }

    &[data-invisible] {
      color: var(--color-fg-disabled);

      .visibility {
        visibility: visible;
      }
    }
  }

  &:hover {
    ${NodeTreeRow} .indent-expander {
      visibility: visible;
    }
  }
`;
