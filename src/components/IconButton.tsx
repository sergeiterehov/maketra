import styled from "styled-components";

export const IconButton = styled.span.withConfig({
  displayName: "IconButton",
})`
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--radius-ui);
  height: 32px;
  width: 32px;
  flex: 0 0 32px;
  line-height: 32px;
  color: var(--color-icon);
  box-sizing: border-box;
  border: 1px solid transparent;

  :hover, :focus {
    background-color: var(--color-bg-hover);
  }
`;
