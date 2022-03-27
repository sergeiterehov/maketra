import { observe, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useRef } from "react";
import { useEffect } from "react";
import { Figure } from "./models/Figure";
import { MkNode } from "./models/MkNode";
import { figureEditor } from "./figureEditor";
import { transformer } from "./transformer";
import { Transform } from "./utils/Transform";
import { editorState } from "./editorState";
import { CanvasRenderer } from "./render/CanvasRenderer";
import { ColorFill } from "./models/Fill";
import { Color } from "./utils/Color";
import { Stroke, StrokeStyle } from "./models/Stroke";

const Viewer = observer<{
  width: number;
  height: number;
}>(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelRatio = devicePixelRatio;

  const { baseTransform, selected, section } = editorState;

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
    if (!section) return;

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
    transformer.adjust(selected);
    figureEditor.adjust(selected instanceof Figure ? selected : undefined);

    if (!selected) return;

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
      } else if (figureEditor.addingMode) {
        // Находимся в режиме добавления точки
        const clickedPoint = figureEditor.points.get(node as Figure);

        if (clickedPoint) {
          figureEditor.createPoint(clickedPoint);
          figureEditor.disableAdding();
          editorState.select(figureEditor.target);
        } else {
          figureEditor.createPoint();
        }
      } else if (node && figureEditor.has(node)) {
        // Редактируем фигуру
        mouseRef.current.figureEditorControl = node;
        mouseRef.current.transformerControl = undefined;
      } else {
        // Выделяем объект
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
      } else if (figureEditor.addingMode && figureEditor.target) {
        const fromParentTransform = new Transform();

        if (figureEditor.newPointParent) {
          fromParentTransform.translate(
            figureEditor.newPointParent.x,
            figureEditor.newPointParent.y
          );
        }

        figureEditor.moveNewPoint(
          baseTransform
            .copy()
            .multiply(figureEditor.target.absoluteTransform)
            .multiply(fromParentTransform)
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
    if (!section) return;

    const downHandler = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body)
        return;

      switch (e.code) {
        case "KeyF": {
          const figure = new Figure();

          figure.name = "New Figure";
          figure.fills.push(new ColorFill(new Color({ hex: "#AAA" })));
          figure.strokes.push(new Stroke(StrokeStyle.Solid, 5));

          section.nodes[0].add(figure);

          editorState.select(undefined);

          figureEditor.adjust(figure);
          figureEditor.enableAdding();

          break;
        }
        case "Enter": {
          figureEditor.disableAdding();
          editorState.select(figureEditor.target);

          break;
        }
        case "MetaLeft": {
          e.preventDefault();
          e.stopPropagation();
          figureEditor.enableControlsMode();
          break;
        }
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body)
        return;

      switch (e.code) {
        case "MetaLeft": {
          figureEditor.disableControlsMode();
          break;
        }
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
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
