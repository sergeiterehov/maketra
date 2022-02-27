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
  const ctxRef = useRef<CanvasRenderingContext2D>(
    null as any as CanvasRenderingContext2D
  );

  const [baseTransform, setBaseTransform] = useState(() => new Transform());

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

  const ctxHit = useMemo(() => hitCanvas.getContext("2d")!, [hitCanvas]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d")!;
  }, []);

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
          next.translate(x - e.deltaX, y - e.deltaY);
          next.scale(scaleX, scaleY);
        }

        return next;
      });
    }

    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", wheelHandler);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = ctxRef.current;

    // Clear

    ctx.resetTransform();
    ctxHit.resetTransform();

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctxHit.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw

    ctx.fillStyle = "#EEE";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const node of section.nodes) {
      node.draw(ctx, ctxHit, baseTransform);
    }
  });

  const clickHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = MkNode.getNodeByHitCtx(ctxHit, x, y);

      onSelect?.(node);
    },
    [ctxHit, onSelect]
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
        width={width}
        height={height}
        onClick={clickHandler}
      />
    </>
  );
});

export default Viewer;
