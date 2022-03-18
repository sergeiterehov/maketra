import { FC, useEffect, useRef } from "react";
import styled from "styled-components";

export const WindowModal = styled<
  FC<{
    className?: string;
    position: { x: number; y: number };
    onMove(position: { x: number; y: number }): void;
    onClose(): void;
  }>
>(({ className, position, onMove, onClose, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const onMoveRef = useRef(onMove);
  const positionRef = useRef(position);
  const onCloseRef = useRef(onClose);

  onMoveRef.current = onMove;
  positionRef.current = position;
  onCloseRef.current = onClose;

  // Избегаем краев экрана.
  useEffect(() => {
    if (!containerRef.current) return;

    const { innerHeight, innerWidth } = window;
    const { top, left, width, height } =
      containerRef.current.getBoundingClientRect();

    const diff = { x: 0, y: 0 };

    const yOverflow = top + height - innerHeight;
    const xOverflow = left + width - innerWidth;

    if (xOverflow > 0) diff.x -= xOverflow;
    if (yOverflow > 0) diff.y -= yOverflow;

    if (diff.x || diff.y) {
      onMoveRef.current({
        x: positionRef.current.x + diff.x,
        y: positionRef.current.y + diff.y,
      });
    }
  }, []);

  // Подписываемся на событие для закрытия.
  useEffect(() => {
    if (!containerRef.current) return;

    const handler = (e: MouseEvent) => {
      let node = e.target as HTMLElement | null;

      while (node && node !== containerRef.current) node = node.parentElement;

      if (node) return;

      onCloseRef.current();
    };

    document.addEventListener("mousedown", handler, true);

    return () => {
      document.removeEventListener("mousedown", handler, true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ top: position.y, left: position.x }}
    >
      {children}
    </div>
  );
}).withConfig({ displayName: "WindowModal" })`
  position: fixed;
  overflow: hidden;
  background-color: var(--color-background);
  outline: solid 1px var(--color-border);
  border-radius: var(--radius-ui);
  box-shadow: 0 2px 7px #0001;
`;
