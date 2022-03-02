import styled from "styled-components";

export const ElementsRow = styled.div.withConfig({displayName: "elements-row"})`
  display: grid;
  grid-template-columns: repeat(28, 8px);
  padding-left: 8px;
  padding-right: 8px;
  align-items: center;
  height: 32px;
`;