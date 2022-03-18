import { FC, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { Color } from "../utils/Color";
import { ColorChit } from "./ColorChit";
import { CustomInput } from "./CustomInput";
import { PaintPicker } from "./PaintPicker";

export const ColorPicker = styled<
  FC<{
    className?: string;
    color: Color;
    onChange(color: Color): void;
  }>
>(({ className, color, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [pickering, setPickering] = useState(false);
  const [pickerInitPosition, setPickerInitPosition] = useState({ x: 0, y: 0 });

  const chitClickHandler = useCallback(() => {
    if (!containerRef.current) return;

    const { left: x, top: y } = containerRef.current.getBoundingClientRect();

    setPickerInitPosition({ x: x - 260, y });
    setPickering(true);
  }, []);

  const pickerCloseHandler = useCallback(() => {
    setPickering(false);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <ColorChit color={color} onClick={chitClickHandler} />
      <CustomInput
        value={color.hex_string_no_alpha.slice(1)}
        onChange={(next) => {
          if (!next) return false;

          next = next.toUpperCase();

          if (!/^#?[0-9A-F]+$/.test(next)) return false;

          if (next[0] !== "#") next = `#${next}`;

          const newColor = color.copy();

          newColor.hex_string = next;

          onChange(newColor);

          return true;
        }}
      />
      <CustomInput
        value={`${Math.round(color.a * 100)}%`}
        onChange={(next) => {
          if (!next) return false;

          const isPercent = next.slice(-1) === "%";

          if (isPercent) next = next.slice(0, -1);

          let value = Number(next);

          if (Number.isNaN(value)) return false;

          const newColor = color.copy();

          if (isPercent) value /= 100;

          newColor.a = Math.min(1, Math.max(0, value));

          onChange(newColor);

          return true;
        }}
      />
      {pickering ? (
        <PaintPicker
          initPosition={pickerInitPosition}
          color={color}
          onChange={onChange}
          onClose={pickerCloseHandler}
        />
      ) : null}
    </div>
  );
}).withConfig({
  displayName: "ColorPicker",
})`
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: var(--radius-ui);
  height: 28px;
  overflow: hidden;
`;
