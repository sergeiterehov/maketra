import { autorun, observe, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useRef } from "react";
import { useEffect } from "react";
import { Figure } from "./models/Figure";
import { MkNode } from "./models/MkNode";
import { Section } from "./models/Section";
import { figureEditor } from "./figureEditor";
import { transformer } from "./transformer";
import { Transform } from "./utils/Transform";
import { FPoint } from "./models/FPoint";
import { editorState } from "./editorState";
import { CanvasRenderer } from "./render/CanvasRenderer";
import { ColorFill } from "./models/Fill";
import { Color } from "./utils/Color";
import { Stroke, StrokeStyle } from "./models/Stroke";

const Viewer = observer<{
  section: Section;
  width: number;
  height: number;
}>(({ width, height, section }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelRatio = devicePixelRatio;

  const { baseTransform, selected } = editorState;

  const allSectionsNodes: MkNode[] = section.nodes.flatMap(
    (node) => node.allNodes
  );

  const hitCanvas = useMemo(() => document.createElement("canvas"), []);

  hitCanvas.width = width * pixelRatio;
  hitCanvas.height = height * pixelRatio;

  const rendererRef = useRef<CanvasRenderer>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    rendererRef.current = new CanvasRenderer(
      context,
      hitCanvas.getContext("2d")!
    );
  }, [hitCanvas]);

  useEffect(() => {
    const renderer = rendererRef.current;

    if (!renderer) return;

    let animRequest = 0;

    const draw = () => {
      renderer.transform = editorState.baseTransform;
      renderer.clear();

      for (const node of section.nodes) {
        renderer.renderNode(node);
      }

      renderer.renderNode(transformer.group);
      renderer.renderNode(figureEditor.group);

      animRequest = window.requestAnimationFrame(draw);
    };

    draw();

    return () => window.cancelAnimationFrame(animRequest);
  }, [section]);

  useEffect(() => {
    if (!selected) {
      figureEditor.adjust();

      return;
    }

    transformer.adjust(selected);
    figureEditor.adjust(selected instanceof Figure ? selected : undefined);

    const stop = observe(selected, () => {
      figureEditor.realign();
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

      runInAction(() => {
        const prev = editorState.baseTransform;

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

        editorState.baseTransform = next;
      });
    }

    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", wheelHandler);
    };
  }, [pixelRatio]);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    dragging: false,
    transformerControl: undefined as undefined | MkNode,
    figureEditorControl: undefined as undefined | MkNode,
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
        mouseRef.current.figureEditorControl = undefined;
      } else if (figureEditor.newPointParent) {
        // Находимся в режиме добавления точки
        const point = figureEditor.points.get(node as Figure);

        if (point) {
          figureEditor.createPoint(point);
          editorState.select(figureEditor.target);
        } else {
          figureEditor.createPoint();
        }
      } else if (node && figureEditor.has(node)) {
        mouseRef.current.figureEditorControl = node;
        mouseRef.current.transformerControl = undefined;
      } else {
        mouseRef.current.transformerControl = undefined;
        mouseRef.current.figureEditorControl = undefined;
        editorState.select(node);
      }

      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.dragging = true;
    },
    [hitCanvas, pixelRatio]
  );

  const mouseMoveHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - mouseRef.current.x;
      const dy = y - mouseRef.current.y;

      const { transformerControl, figureEditorControl } = mouseRef.current;

      if (mouseRef.current.dragging) {
        if (transformerControl) {
          transformer.moveControlBy(transformerControl, dx, dy);

          if (selected) transformer.applyTo(selected);
        } else if (figureEditorControl) {
          figureEditor.moveControlBy(figureEditorControl, dx, dy);
        } else if (selected) {
          runInAction(() => {
            selected.x += dx;
            selected.y += dy;
          });
        }
      } else if (figureEditor.newPointParent) {
        figureEditor.moveNewPoint(
          baseTransform
            .copy()
            .multiply(figureEditor.target!.absoluteTransform)
            .multiply(
              new Transform().translate(
                figureEditor.newPointParent.x,
                figureEditor.newPointParent.y
              )
            )
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y })
        );
      }

      mouseRef.current.x = x;
      mouseRef.current.y = y;
    },
    [selected, baseTransform, pixelRatio]
  );

  const mouseUpHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      mouseRef.current.dragging = false;
    },
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { x, y } = mouseRef.current;

      switch (e.code) {
        case "KeyF": {
          const figure = new Figure();

          figure.name = "New Figure";
          figure.fills.push(new ColorFill(new Color({ hex: "#AAA" })));
          figure.strokes.push(new Stroke(StrokeStyle.Solid, 5));

          const vec2d = baseTransform
            .copy()
            .multiply(section.nodes[0].absoluteTransform)
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y });

          figure.points = [new FPoint(vec2d.x, vec2d.y)];

          section.nodes[0].add(figure);

          editorState.select(undefined);

          figureEditor.adjust(figure);
          figureEditor.showNewPoint();

          break;
        }
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [baseTransform, pixelRatio, section]);

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
