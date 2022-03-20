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
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid transparent;

  &[data-checked] {
    &::after {
      content: "";
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: var(--radius-ui);
      background-color: var(--color-bg-hover);
      z-index: -1;
    }
  }

  :hover,
  :focus {
    border-radius: calc(1px + var(--radius-ui));
    box-shadow: inset 0 0 0 1px var(--color-border);
  }
`;
