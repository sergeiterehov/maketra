import { FC, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

const ScrubberContainer = styled.label.withConfig({
  displayName: "scrubber-container",
})`
  user-select: none;
`;

export const Scrubber: FC<{
  className?: string;
  value?: number;
  speed?: number;
  units?: string;
  onChange?(newValue?: number, units?: string): void;
}> = ({ children, value, units, onChange, className, speed = 0.1 }) => {
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
        onChange(valueRef.current + dx * speed);
      }
    };

    window.addEventListener("mouseup", mouseUpRawHandler, true);
    window.addEventListener("mousemove", mouseMoveRawHandler, true);

    return () => {
      window.removeEventListener("mouseup", mouseUpRawHandler, true);
      window.removeEventListener("mousemove", mouseMoveRawHandler, true);
    };
  }, [onChange, speed]);

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
