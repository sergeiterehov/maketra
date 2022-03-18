import { FC, useState } from "react";
import styled from "styled-components";
import { Color } from "../utils/Color";
import { ColorController } from "./ColorController";
import { WindowModal } from "./WindowModal";

export const PaintPicker = styled<
  FC<{
    className?: string;
    initPosition: { x: number; y: number };
    color: Color;
    onChange(color: Color): void;
    onClose(): void;
  }>
>(({ color, onChange, initPosition, className, onClose }) => {
  const [position, setPosition] = useState(initPosition);

  return (
    <WindowModal
      className={className}
      onClose={onClose}
      position={position}
      onMove={setPosition}
    >
      <ColorController color={color} onChange={onChange} />
    </WindowModal>
  );
}).withConfig({ displayName: "PaintPicker" })`
  width: 240px;
`;
