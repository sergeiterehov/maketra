import { action, observable } from "mobx";
import { Figure } from "./models/Figure";
import { ColorFill } from "./models/Fill";
import { FPoint } from "./models/FPoint";
import { Group } from "./models/Group";
import { MkNode } from "./models/MkNode";
import { Stroke, StrokeStyle } from "./models/Stroke";
import { Vector2d } from "./utils/Transform";

const linesColor = "#0FF";
const pointsColor = "#DEF";
const pointsBorderColor = "#0AF";

const newPointLine = new Figure().configure({
  interactive: false,
  points: FPoint.createLine(0, 0, 1, 1),
  strokes: [new Stroke(StrokeStyle.Solid, 1, linesColor)],
});
const controlsGroup = new Group();
const figureEditorGroup = new Group()
  .configure({
    name: "FigureEdit",
  })
  .add(controlsGroup, newPointLine);

export const figureEditor = observable(
  {
    group: figureEditorGroup,
    /** Соответствие точке трансформерам. */
    points: new Map<Figure, FPoint>(),
    /** Соединяющие линии. */
    lines: new Map<Figure, FPoint>(),

    target: undefined as Figure | undefined,

    /** Точка после которой будет выполняться дорисовка. */
    newPointParent: undefined as FPoint | undefined,
    newPointOffset: { x: 0, y: 0 } as Vector2d,

    has(node: MkNode): boolean {
      return controlsGroup.allNodes.includes(node);
    },

    adjust(figure?: Figure) {
      // Остальные объекты уничтожаются.
      for (const c of [...controlsGroup.children]) c.destroy();

      this.points.clear();
      this.lines.clear();

      this.target = figure;

      if (!figure) return;

      const at = figure.absoluteTransform;
      const { x, y } = at.decompose();

      // Сперва создаем соединительные линии.

      for (const p of figure.points) {
        if (!p.links.length) continue;

        const l = new Figure().configure({
          interactive: false, // TODO:
          points: p.linkedPoints.flatMap((pp) =>
            FPoint.createLine(x + p.x, y + p.y, x + pp.x, y + pp.y)
          ),
          strokes: [new Stroke(StrokeStyle.Solid, 1, linesColor)],
        });

        this.lines.set(l, p);
        l.moveTo(controlsGroup);
      }

      // Поверх линий накладываем трансформеры.

      for (const p of figure.points) {
        const t = new Figure().configure({
          points: FPoint.createRect(0, 0, 6, 6),
          x: x + p.x - 3,
          y: y + p.y - 3,
          strokes: [new Stroke(StrokeStyle.Solid, 1, pointsBorderColor)],
          fills: [new ColorFill(pointsColor)],
        });

        this.points.set(t, p);
        t.moveTo(controlsGroup);
      }
    },

    realign() {
      const figure = this.target;

      if (!figure) return;

      const at = figure.absoluteTransform;
      const { x, y } = at.decompose();

      // Линии

      for (const l of this.lines.keys()) {
        const p = this.lines.get(l);

        if (!p) continue;

        p.linkedPoints.forEach((pp, i) => {
          Object.assign(l.points[i * 2], {
            x: x + p.x,
            y: y + p.y,
          });
          Object.assign(l.points[i * 2 + 1], {
            x: x + pp.x,
            y: y + pp.y,
          });
        });

        Object.assign(l, {
          x: 0,
          y: 0,
        });
      }

      // Сами точки

      for (const t of this.points.keys()) {
        const p = this.points.get(t);

        if (!p) continue;

        Object.assign(t, {
          x: x + p.x - 3,
          y: y + p.y - 3,
        });
      }

      // Новая точка

      if (this.newPointParent) {
        newPointLine.visible = true;

        newPointLine.x = x + this.newPointParent.x;
        newPointLine.y = y + this.newPointParent.y;

        newPointLine.points[0].x = 0;
        newPointLine.points[0].y = 0;

        newPointLine.points[1].x = this.newPointOffset.x;
        newPointLine.points[1].y = this.newPointOffset.y;

        newPointLine.points = [...newPointLine.points];
      } else {
        newPointLine.visible = false;
      }
    },

    moveControlBy(node: MkNode, dx: number, dy: number) {
      const point = this.points.get(node as Figure);

      if (point) {
        point.x += dx;
        point.y += dy;
      } else {
        return;
      }

      if (this.target) {
        this.target.adjustPointsAndSize();
      }

      this.realign();
    },

    showNewPoint() {
      const { target } = this;

      if (!target) return;

      const { points } = target;

      this.newPointParent = points[points.length - 1];

      if (!this.newPointParent) return;

      this.newPointOffset.x = 0;
      this.newPointOffset.y = 0;

      this.realign();
    },

    moveNewPoint(newPosition: Vector2d) {
      this.newPointOffset.x = newPosition.x;
      this.newPointOffset.y = newPosition.y;

      this.realign();
    },

    createPoint(toPoint?: FPoint) {
      if (!this.newPointParent) return;

      if (!this.target) return;

      const { x, y } = this.newPointOffset;

      this.newPointOffset.x = 0;
      this.newPointOffset.y = 0;

      if (toPoint) {
        this.newPointParent.connect(toPoint);
        this.newPointParent = undefined;
      } else {
        const next = this.newPointParent.line(x, y);

        this.target.points = next.allPoints;
        this.newPointParent = next;
      }

      this.target.adjustPointsAndSize();
      this.adjust(this.target);
    },
  },
  {
    adjust: action,
    moveControlBy: action,
    realign: action,
    moveNewPoint: action,
    createPoint: action,
    showNewPoint: action,
  }
);

//TODO:
Object.assign(window, { figureEditor });
