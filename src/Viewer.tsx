import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useRef } from "react";
import { useEffect } from "react";
import { Figure } from "./models/Figure";
import { MkNode } from "./models/MkNode";
import { figureEditor } from "./figureEditor";
import { transformer } from "./transformer";
import { Transform } from "./utils/Transform";
import { editorState, ToolMode } from "./editorState";
import { CanvasRenderer } from "./render/CanvasRenderer";
import { ColorFill } from "./models/Fill";
import { Color } from "./utils/Color";
import { Area } from "./models/Area";
import { Text } from "./models/Text";
import { Stroke } from "./models/Stroke";
import {
  FigureEditorControl,
  FigureEditorPoint,
} from "./models/controllers/FigureEditor";
import { FPoint } from "./models/FPoint";

function findNodeForCreating(node: MkNode) {
  let lookup: MkNode | undefined = node;

  while (lookup && !(lookup instanceof Area)) {
    lookup = lookup.parentNode;
  }

  if (!lookup && node.parentSection) {
    for (const root of node.parentSection.nodes) {
      if (root instanceof Area) {
        lookup = root;
      }
    }
  }

  return lookup;
}

export const Viewer = observer<{
  width: number;
  height: number;
}>(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelRatio = devicePixelRatio;

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
      const { section, baseTransform, tool } = editorState;

      if (!section) return;

      renderer.transform = baseTransform;
      renderer.clear();

      for (const node of section.nodes) {
        renderer.renderNode(node);
      }

      if (
        tool === ToolMode.PointBender ||
        tool === ToolMode.FigureEditor ||
        tool === ToolMode.PointPen
      ) {
        renderer.renderNode(figureEditor);
      } else {
        renderer.renderNode(transformer.group);
      }

      animRequest = window.requestAnimationFrame(draw);
    };

    draw();

    return () => window.cancelAnimationFrame(animRequest);
  }, []);

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

      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.dragging = true;

      const { tool, section, selected, baseTransform } = editorState;

      switch (tool) {
        case ToolMode.Transformer: {
          if (!node || section?.includes(node)) {
            // Это объект или пустое место, просто выделаем его.
            mouseRef.current.transformerControl = undefined;
            editorState.select(node);
          } else if (transformer.includes(node)) {
            // Это элементы трансформера, сохраняем выделение.
            mouseRef.current.transformerControl = node;
          }

          break;
        }
        case ToolMode.TextAdder: {
          const parent = selected && findNodeForCreating(selected);
          const transform = baseTransform.copy();

          if (parent) {
            transform.multiply(parent.absoluteTransform);
          }

          const location = transform
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y });

          const newText = new Text();

          newText.name = "Надпись";
          newText.text = "Поменяй меня";
          newText.fills.push(new ColorFill(new Color({ hex: "#000" })));
          newText.configure({
            x: Math.round(location.x),
            y: Math.round(location.y),
          });

          if (parent) {
            newText.appendTo(parent);
          } else {
            newText.appendToSection(section);
          }

          editorState.select(newText);
          editorState.changeTool(ToolMode.Default);

          break;
        }
        case ToolMode.AreaAdder: {
          const parent = selected && findNodeForCreating(selected);
          const transform = baseTransform.copy();

          if (parent) {
            transform.multiply(parent.absoluteTransform);
          }

          const location = transform
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y });

          const newArea = new Area();

          newArea.name = "Новая область";
          newArea.configure({
            x: Math.round(location.x),
            y: Math.round(location.y),
          });

          if (parent) {
            newArea.appendTo(parent);
          } else {
            newArea.appendToSection(section);
          }

          editorState.creatingArea = newArea;
          editorState.select(newArea);

          break;
        }
        case ToolMode.FigureEditor:
        case ToolMode.PointPen:
        case ToolMode.PointBender: {
          const position = baseTransform
            .copy()
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y });

          position.x = Math.round(position.x);
          position.y = Math.round(position.y);

          figureEditor.onMouseDown(position, node);

          if (figureEditor.wannaFinishCreating) {
            editorState.changeTool(ToolMode.Transformer);
            figureEditor.wannaFinishCreating();
          }

          if (figureEditor.wannaCreateFigureFromPoint) {
            const parent = selected && findNodeForCreating(selected);
            const transform = baseTransform.copy();

            if (parent) {
              transform.multiply(parent.absoluteTransform);
            }

            const location = transform
              .invert()
              .scale(pixelRatio, pixelRatio)
              .point({ x, y });

            const newFigure = new Figure().configure({
              name: "Новая фигура",
              x: Math.round(location.x),
              y: Math.round(location.y),
              fills: [new ColorFill(new Color({ hex: "#BBB" }))],
              strokes: [new Stroke()],
              points: [new FPoint(0, 0)],
            });

            if (parent) {
              newFigure.appendTo(parent);
            } else {
              newFigure.appendToSection(section);
            }

            editorState.select(newFigure);
            figureEditor.setTarget(newFigure);

            figureEditor.wannaCreateFigureFromPoint();
          }

          break;
        }
      }
    },
    [hitCanvas, pixelRatio]
  );

  const mouseMoveHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { dragging } = mouseRef.current;

      const dx = Math.round(x - mouseRef.current.x);
      const dy = Math.round(y - mouseRef.current.y);

      mouseRef.current.x = x;
      mouseRef.current.y = y;

      const { transformerControl } = mouseRef.current;
      const { selected, tool, baseTransform, creatingArea } = editorState;

      switch (tool) {
        case ToolMode.Transformer: {
          if (!dragging) {
            // Ничего не делаем.
          } else if (transformerControl) {
            transformer.moveControlBy(transformerControl, dx, dy);
          } else if (selected) {
            runInAction(() => {
              selected.x += dx;
              selected.y += dy;
            });
          }

          break;
        }
        case ToolMode.AreaAdder: {
          if (creatingArea) {
            const parent = creatingArea.parentNode;
            const transform = baseTransform.copy();

            if (parent) {
              transform.multiply(parent.absoluteTransform);
            }

            const location = transform
              .invert()
              .scale(pixelRatio, pixelRatio)
              .point({ x, y });

            creatingArea.configure({
              width: Math.max(0, Math.round(location.x - creatingArea.x)),
              height: Math.max(0, Math.round(location.y - creatingArea.y)),
            });
          }

          break;
        }
        case ToolMode.FigureEditor:
        case ToolMode.PointPen:
        case ToolMode.PointBender: {
          const position = baseTransform
            .copy()
            .invert()
            .scale(pixelRatio, pixelRatio)
            .point({ x, y });

          position.x = Math.round(position.x);
          position.y = Math.round(position.y);

          figureEditor.onMouseMove(position);

          break;
        }
      }
    },
    [pixelRatio]
  );

  const mouseUpHandler = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      mouseRef.current.dragging = false;

      const { tool } = editorState;

      switch (tool) {
        case ToolMode.AreaAdder: {
          editorState.creatingArea = undefined;
          editorState.changeTool(ToolMode.Default);

          break;
        }
        case ToolMode.FigureEditor:
        case ToolMode.PointPen:
        case ToolMode.PointBender: {
          figureEditor.onMouseUp();

          break;
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!editorState.section) return;

    const keyDownHandler = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body)
        return;

      let intercepted = true;

      switch (e.code) {
        case "Enter": {
          switch (editorState.tool) {
            case ToolMode.Transformer: {
              if (editorState.selected instanceof Figure) {
                editorState.changeTool(ToolMode.FigureEditor);
              }

              break;
            }
            case ToolMode.FigureEditor: {
              editorState.changeTool(ToolMode.Transformer);

              break;
            }
            case ToolMode.PointPen: {
              figureEditor.setCreating(false);
              editorState.changeTool(ToolMode.Transformer);

              break;
            }
          }

          break;
        }
        case "MetaLeft": {
          figureEditor.setControlsMode(true);

          break;
        }
        case "ShiftLeft": {
          figureEditor.setFreeMovementMode(true);

          break;
        }
        case "KeyD": {
          editorState.changeTool(ToolMode.Transformer);

          break;
        }
        case "KeyF": {
          editorState.changeTool(ToolMode.PointPen);

          break;
        }
        case "KeyT": {
          editorState.changeTool(ToolMode.TextAdder);

          break;
        }
        case "KeyA": {
          editorState.changeTool(ToolMode.AreaAdder);

          break;
        }
        case "Backspace": {
          const { selected } = editorState;

          switch (editorState.tool) {
            case ToolMode.Transformer: {
              if (selected) {
                editorState.select();
                selected.destroy();
              }

              break;
            }
            case ToolMode.FigureEditor: {
              if (figureEditor.target) {
                if (figureEditor.activeModel instanceof FigureEditorPoint) {
                  figureEditor.target.removePoint(
                    figureEditor.activeModel.point
                  );
                } else if (
                  figureEditor.activeModel instanceof FigureEditorControl
                ) {
                  figureEditor.activeModel.moveTo(0, 0);
                }

                figureEditor.realign();
              }

              break;
            }
          }

          break;
        }
        default: {
          intercepted = false;
        }
      }

      if (intercepted) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body)
        return;

      let intercepted = true;

      switch (e.code) {
        case "MetaLeft": {
          figureEditor.setControlsMode(false);

          break;
        }
        case "ShiftLeft": {
          figureEditor.setFreeMovementMode(false);

          break;
        }
        default: {
          intercepted = false;
        }
      }

      if (intercepted) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [pixelRatio]);

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
