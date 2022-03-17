import styled from "styled-components";
import { NodeTreeRow } from "./components/NodeTreeRow";

export const ObjectsContainer = styled.div.withConfig({
  displayName: "ObjectsContainer",
})`
  ${NodeTreeRow} .indent-expander {
    visibility: hidden;
  }

  &:hover {
    ${NodeTreeRow} .indent-expander {
      visibility: visible;
    }
  }
`;
