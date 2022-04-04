import { action, observable } from "mobx";
import { Figure } from "./models/Figure";
import { ColorFill } from "./models/Fill";
import { FControl, FLink, FPoint } from "./models/FPoint";
import { Group } from "./models/Group";
import { MkNode } from "./models/MkNode";
import { Stroke, StrokeStyle } from "./models/Stroke";
import { Color } from "./utils/Color";
import { Vector2d } from "./utils/Transform";

const linesColor = new Color({ hex: "#0FF" });
const controlsLinesColor = new Color({ hex: "#0AF" });
const pointsColor = new Color({ hex: "#DEF" });
const pointsBorderColor = new Color({ hex: "#0AF" });
const controlsBorderColor = new Color({ hex: "#A0F" });

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
  .appendChild(controlsGroup, newPointLine);

export const figureEditor = observable(
  {
    group: figureEditorGroup,
    /** Соответствие точке трансформерам. */
    points: new Map<Figure, FPoint>(),
    /** Соединяющие линии. */
    lines: new Map<Figure, FPoint>(),
    /** Контрольные точки. */
    // prettier-ignore
    controls: new Map<Figure, { link: FLink; point: FPoint; control: FControl }>(),
    /** Линии до контрольных точек. */
    // prettier-ignore
    controlsLines: new Map<Figure, { link: FLink; point: FPoint; control: FControl }>(),

    target: undefined as Figure | undefined,

    /** Находимся в режиме добавления новой точки. */
    addingMode: false,
    /** Управляем только контрольными точками. */
    controlsMode: false,
    /** Свободное управление контрольными точками. */
    controlsFreeMode: false,

    /** Точка после которой будет выполняться дорисовка. */
    newPointParent: undefined as FPoint | undefined,
    newPointOffset: { x: 0, y: 0 } as Vector2d,

    includes(node: MkNode): boolean {
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

      const links: FLink[] = [];

      for (const point of figure.points) {
        for (const link of point.links) {
          if (!links.includes(link)) {
            links.push(link);
          }
        }
      }

      // Сперва создаем соединительные линии.

      for (const p of figure.points) {
        if (!p.links.length) continue;

        const l = new Figure().configure({
          // TODO: сделать перемещение линий
          interactive: false,
          // TODO: переделать на links
          points: p.linkedPoints.flatMap((pp) =>
            FPoint.createLine(x + p.x, y + p.y, x + pp.x, y + pp.y)
          ),
          strokes: [new Stroke(StrokeStyle.Solid, 1, linesColor)],
        });

        this.lines.set(l, p);
        l.appendTo(controlsGroup);
      }

      // Линии контрольных точек

      for (const link of links) {
        const { a, b, aControl, bControl } = link;

        for (const meta of [
          { point: a, control: aControl },
          { point: b, control: bControl },
        ]) {
          const { point, control } = meta;

          const cl = new Figure().configure({
            interactive: false,
            points: FPoint.createLine(
              x + point.x,
              y + point.y,
              x + point.x + control.x,
              y + point.y + control.y
            ),
            strokes: [new Stroke(StrokeStyle.Solid, 1, controlsLinesColor)],
          });

          this.controlsLines.set(cl, { link, point, control });
          cl.appendTo(controlsGroup);
        }
      }

      // Трансформеры контрольных точек.

      for (const link of links) {
        const { a, b, aControl, bControl } = link;

        for (const meta of [
          { point: a, control: aControl },
          { point: b, control: bControl },
        ]) {
          const { point, control } = meta;

          const c = new Figure().configure({
            points: FPoint.createRect(0, 0, 4, 4),
            x: x + point.x + control.x - 2,
            y: y + point.y + control.y - 2,
            strokes: [new Stroke(StrokeStyle.Solid, 1, controlsBorderColor)],
            fills: [new ColorFill(pointsColor)],
          });

          this.controls.set(c, { link, point, control });
          c.appendTo(controlsGroup);
        }
      }

      // Трансформеры точек.

      for (const p of figure.points) {
        const t = new Figure().configure({
          points: FPoint.createRect(0, 0, 6, 6),
          x: x + p.x - 3,
          y: y + p.y - 3,
          strokes: [new Stroke(StrokeStyle.Solid, 1, pointsBorderColor)],
          fills: [new ColorFill(pointsColor)],
        });

        this.points.set(t, p);
        t.appendTo(controlsGroup);
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

        const { linkedPoints } = p;

        for (let i = 0; i < linkedPoints.length; i += 1) {
          const pp = linkedPoints[i];

          Object.assign(l.points[i * 2], {
            x: x + p.x,
            y: y + p.y,
          });
          Object.assign(l.points[i * 2 + 1], {
            x: x + pp.x,
            y: y + pp.y,
          });
        }

        l.configure({
          x: 0,
          y: 0,
        });
      }

      // Контрольные точки

      for (const c of this.controls.keys()) {
        const meta = this.controls.get(c);

        if (!meta) continue;

        const { control, point } = meta;

        c.configure({
          x: x + point.x + control.x - 2,
          y: y + point.y + control.y - 2,
        });
      }

      // Линии контрольных точек

      for (const cl of this.controlsLines.keys()) {
        const meta = this.controlsLines.get(cl);

        if (!meta) continue;

        const { control, point } = meta;

        cl.configure({
          x: 0,
          y: 0,
        });

        Object.assign(cl.points[0], {
          x: x + point.x,
          y: y + point.y,
        });

        Object.assign(cl.points[1], {
          x: x + point.x + control.x,
          y: y + point.y + control.y,
        });
      }

      // Сами точки

      for (const t of this.points.keys()) {
        const p = this.points.get(t);

        if (!p) continue;

        t.configure({
          interactive: !this.controlsMode,
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
        const controlMeta = this.controls.get(node as Figure);

        if (controlMeta) {
          const { control, link, point } = controlMeta;

          // Проверяем возможность синхронного перемещения противоположной точки.
          if (!this.controlsFreeMode && point.links.length === 2) {
            const oppositeLink =
              point.links[0] === link ? point.links[1] : point.links[0];
            const opposite = oppositeLink.getControlFor(point);

            if (opposite.x === -control.x && opposite.y === -control.y) {
              opposite.x -= dx;
              opposite.y -= dy;
            }
          }

          control.x += dx;
          control.y += dy;
        } else return;
      }

      if (this.target) {
        this.target.adjustPointsAndSize();
      }

      this.realign();
    },

    enableAdding() {
      const { target } = this;

      if (!target) return;

      this.addingMode = true;

      const { points } = target;

      this.newPointParent = points[points.length - 1];

      if (!this.newPointParent) return;

      this.newPointOffset.x = 0;
      this.newPointOffset.y = 0;

      this.realign();
    },

    disableAdding() {
      this.addingMode = false;
      this.newPointParent = undefined;

      this.realign();
    },

    moveNewPoint(newPosition: Vector2d) {
      this.newPointOffset.x = newPosition.x;
      this.newPointOffset.y = newPosition.y;

      this.realign();
    },

    createPoint(toPoint?: FPoint) {
      if (!this.target) return;

      const { x, y } = this.newPointOffset;

      this.newPointOffset.x = 0;
      this.newPointOffset.y = 0;

      if (this.newPointParent) {
        if (toPoint) {
          this.newPointParent.connect(toPoint);
          this.newPointParent = undefined;
        } else {
          const next = this.newPointParent.line(x, y);

          this.target.points = next.allPoints;
          this.newPointParent = next;
        }
      } else {
        const next = new FPoint(x, y);

        this.target.points.push(next);
        this.newPointParent = next;
      }

      this.target.adjustPointsAndSize();
      this.adjust(this.target);
    },

    enableControlsMode() {
      this.controlsMode = true;
      this.realign();
    },
    disableControlsMode() {
      this.controlsMode = false;
      this.realign();
    },

    enableFreeControlsMode() {
      this.controlsFreeMode = true;
    },
    disableFreeControlsMode() {
      this.controlsFreeMode = false;
    },
  },
  {
    adjust: action,
    moveControlBy: action,
    realign: action,
    moveNewPoint: action,
    createPoint: action,
    enableAdding: action,
    disableAdding: action,
    enableControlsMode: action,
    disableControlsMode: action,
    enableFreeControlsMode: action,
    disableFreeControlsMode: action,
  }
);

//TODO:
Object.assign(window, { figureEditor });
