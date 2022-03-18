import { FC, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

export const ScrubberContainer = styled.label.withConfig({
  displayName: "scrubber-container",
})`
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: var(--radius-ui);
  height: 28px;
  overflow: hidden;
`;

export const Scrubber: FC<{
  className?: string;
  value?: number;
  speed?: number;
  min?: number;
  max?: number;
  onChange?(newValue?: number): void;
}> = ({
  children,
  value,
  min = -Infinity,
  max = +Infinity,
  onChange,
  className,
  speed = 1,
}) => {
  const valueRef = useRef(value);

  valueRef.current = value;

  const trackingRef = useRef(false);

  useEffect(() => {
    if (!onChange) return;

    const mouseUpRawHandler = (e: MouseEvent) => {
      if (!trackingRef.current) return;

      trackingRef.current = false;
    };

    const mouseMoveRawHandler = (e: MouseEvent) => {
      if (!trackingRef.current) return;

      const dx = e.movementX;
      const dy = e.movementY;

      if (valueRef.current !== undefined) {
        onChange(Math.max(min, Math.min(max, valueRef.current + dx * speed)));
      }
    };

    window.addEventListener("mouseup", mouseUpRawHandler, true);
    window.addEventListener("mousemove", mouseMoveRawHandler, true);

    return () => {
      window.removeEventListener("mouseup", mouseUpRawHandler, true);
      window.removeEventListener("mousemove", mouseMoveRawHandler, true);
    };
  }, [max, min, onChange, speed]);

  const mouseDownHandler: React.MouseEventHandler<HTMLLabelElement> =
    useCallback((e) => {
      e.currentTarget.requestPointerLock();

      trackingRef.current = true;
    }, []);

  const mouseUpHandler: React.MouseEventHandler<HTMLLabelElement> = useCallback(
    (e) => {
      document.exitPointerLock();

      if (!trackingRef.current) return;

      trackingRef.current = false;
    },
    []
  );

  return (
    <ScrubberContainer
      className={className}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
    >
      {children}
    </ScrubberContainer>
  );
};
