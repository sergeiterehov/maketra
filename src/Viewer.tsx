import { Transform } from "konva/lib/Util";
import { autorun, observe, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEffect } from "react";
import { MkNode } from "./models/MkNode";
import { Section } from "./models/Section";
import { transformer } from "./transformer";

const Viewer = observer<{
  section: Section;
  width: number;
  height: number;
  selected?: MkNode;
  onSelect?(node?: MkNode): void;
}>(({ width, height, section, selected, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelRatio = devicePixelRatio;

  const [baseTransform, setBaseTransform] = useState(() =>
    new Transform().scale(pixelRatio, pixelRatio)
  );

  const allSectionsNodes: MkNode[] = section.nodes.flatMap(
    (node) => node.allNodes
  );

  const hitCanvas = useMemo(() => document.createElement("canvas"), []);

  hitCanvas.width = width * pixelRatio;
  hitCanvas.height = height * pixelRatio;

  const draw = useCallback(() => {
    const ctxView = canvasRef.current!.getContext("2d")!;
    const ctxHit = hitCanvas.getContext("2d")!;

    // Clear

    ctxView.resetTransform();
    ctxHit.resetTransform();

    ctxHit.imageSmoothingEnabled = false;

    ctxView.clearRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);
    ctxHit.clearRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);

    // Draw

    ctxView.fillStyle = "#DDD";
    ctxView.fillRect(0, 0, ctxView.canvas.width, ctxView.canvas.height);

    for (const node of section.nodes) {
      node.draw(ctxView, ctxHit, baseTransform);
    }

    if (selected) {
      transformer.group.draw(ctxView, ctxHit, baseTransform);
    }
  }, [baseTransform, hitCanvas, section, selected]);

  useEffect(() => autorun(() => draw()), [draw, section]);

  useEffect(() => {
    if (!selected) return;

    transformer.adjust(selected);

    const stop = observe(selected, () => {
      transformer.adjust(selected).realign();
    });

    return stop;
  }, [selected]);

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
    draw();
  });

  const mouseRef = useRef({
    x: 0,
    y: 0,
    dragging: false,
    transformerControl: undefined as undefined | MkNode,
  });

  const mouseDownHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const ctxHit = hitCanvas.getContext("2d")!;

      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = MkNode.getNodeByHitCtx(
        ctxHit,
        x * pixelRatio,
        y * pixelRatio
      );

      // Если это трансформер, то не выделять его не нужно.
      if (node && transformer.has(node)) {
        mouseRef.current.transformerControl = node;
      } else {
        mouseRef.current.transformerControl = undefined;
        onSelect?.(node);
      }

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

      if (mouseRef.current.dragging) {
        const { transformerControl } = mouseRef.current;

        if (transformerControl) {
          transformer.moveControlBy(
            transformerControl,
            x - mouseRef.current.x,
            y - mouseRef.current.y
          );

          if (selected) transformer.applyTo(selected);
        } else if (selected) {
          runInAction(() => {
            selected.x += x - mouseRef.current.x;
            selected.y += y - mouseRef.current.y;
          });
        }
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
