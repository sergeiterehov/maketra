import { Transform } from "konva/lib/Util";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEffect } from "react";
import { MkNode, Section } from "./models";

const Viewer = observer<{
  section: Section;
  width: number;
  height: number;
  selected?: MkNode;
  onSelect?(node?: MkNode): void;
}>(({ width, height, section, selected, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelRatio = devicePixelRatio;

  const [baseTransform, setBaseTransform] = useState(() => new Transform().scale(pixelRatio, pixelRatio));

  const flatNodes: MkNode[] = [];
  const lookup = [...section.nodes];

  while (lookup.length) {
    const node = lookup.pop()!;

    if (flatNodes.includes(node)) continue;

    flatNodes.push(node);
    lookup.push(...node.children);
  }

  const hitCanvas = useMemo(() => document.createElement("canvas"), []);

  hitCanvas.width = width;
  hitCanvas.height = height;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    function wheelHandler(this: HTMLCanvasElement, e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();

      setBaseTransform((prev) => {
        const next = new Transform();
        const { x, y, scaleX, scaleY } = prev.decompose();

        const rect = this.getBoundingClientRect();

        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (e.ctrlKey) {
          const factor = e.deltaY / 100;

          next.translate(x, y);
          next.scale(scaleX - factor, scaleY - factor);
        } else {
          next.translate(x - e.deltaX * pixelRatio, y - e.deltaY * pixelRatio);
          next.scale(scaleX, scaleY);
        }

        return next;
      });
    }

    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", wheelHandler);
    };
  }, [pixelRatio]);

  useLayoutEffect(() => {
    const ctxView = canvasRef.current!.getContext("2d")!;
    const ctxHit = hitCanvas.getContext("2d")!;

    // Clear

    ctxView.resetTransform();
    ctxHit.resetTransform();

    ctxHit.imageSmoothingEnabled = false;

    ctxView.clearRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);
    ctxHit.clearRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);

    // Draw

    ctxView.fillStyle = "#EEE";
    ctxView.fillRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);

    for (const node of section.nodes) {
      node.draw(ctxView, ctxHit, baseTransform);
    }
  });

  const mouseRef = useRef({ x: 0, y: 0, dragging: false });

  const mouseDownHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const ctxHit = hitCanvas.getContext("2d")!;

      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = MkNode.getNodeByHitCtx(ctxHit, x * pixelRatio, y * pixelRatio);

      onSelect?.(node);

      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.dragging = true;
    },
    [hitCanvas, onSelect, pixelRatio]
  );

  const mouseMoveHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (mouseRef.current.dragging && selected) {
        selected.x += x - mouseRef.current.x;
        selected.y += y - mouseRef.current.y;
      }

      mouseRef.current.x = x;
      mouseRef.current.y = y;
    },
    [selected]
  );

  const mouseUpHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      mouseRef.current.dragging = false;
    },
    []
  );

  return (
    <>
      <div style={{ display: "none" }}>
        {flatNodes
          .map((n) =>
            Object.keys(n)
              .map((k) => (n as any)[k])
              .join()
          )
          .join()}
      </div>
      <canvas
        ref={canvasRef}
        width={width * pixelRatio}
        height={height * pixelRatio}
        style={{ width, height }}
        onMouseDown={mouseDownHandler}
        onMouseMove={mouseMoveHandler}
        onMouseUp={mouseUpHandler}
      />
    </>
  );
});

export default Viewer;
