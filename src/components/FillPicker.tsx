import { FC, ReactNode, useRef } from "react";
import styled from "styled-components";
import { CustomInput } from "./CustomInput";

export const FillPicker = styled<
  FC<{
    className?: string;
    name: string;
    preview: ReactNode;
  }>
>(({ className, name, preview }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className}>
      <div className="FillPicker-preview">{preview}</div>
      <CustomInput className="FillPicker-hex" value={name} />
      <CustomInput className="FillPicker-alpha" value="100%" />
    </div>
  );
}).withConfig({
  displayName: "FillPicker",
})`
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: var(--radius-ui);
  height: 28px;
  overflow: hidden;
  padding: 0 8px;

  .FillPicker-preview {
    margin-right: 8px;
    display: flex;
    width: 16px;
    height: 16px;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .FillPicker-alpha {
    width: 42px;
  }
`;
