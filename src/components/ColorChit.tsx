import { FC, MouseEvent } from "react";
import styled from "styled-components";
import { Color } from "../utils/Color";

const cheeseBoardBackground =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="#FFF">
<path d="M0 0H3V3H0V0Z" fill="#DDD"/>
<path d="M3 3H6V6H3V3Z" fill="#DDD"/>
</svg>`
  );

export const ColorChit = styled<
  FC<{
    className?: string;
    color: Color;
    onClick?(e: MouseEvent<HTMLSpanElement>): void;
  }>
>(({ className, color, onClick }) => {
  return (
    <span
      className={className}
      data-too-bright={color.humanLuminance > 0.95 ? "" : undefined}
      onClick={onClick}
    >
      <span style={{ backgroundColor: color.hex_string_no_alpha }} />
      <span style={{ backgroundColor: color.hex_string }} />
    </span>
  );
}).withConfig({
  displayName: "ColorChit",
})`
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: var(--radius-ui);
  overflow: hidden;
  background-image: url(${cheeseBoardBackground});

  span {
    display: block;
    width: 50%;
    height: 100%;
  }
`;
