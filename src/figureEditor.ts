import { action, observable, runInAction } from "mobx";
import { Figure } from "./models/Figure";
import { FPoint } from "./models/FPoint";
import { Group } from "./models/Group";
import { MkNode } from "./models/MkNode";

const figureEditorGroup = Object.assign(new Group(), { name: "FigureEdit" });

export const figureEditor = observable(
  {
    group: figureEditorGroup,
    /** Соответствие точке трансформерам. */
    points: new Map<Figure, FPoint>(),
    /** Трансформеры кривых. */
    curvesBefore: new Map<Figure, FPoint>(),
    curvesAfter: new Map<Figure, FPoint>(),
    /** Соединяющие линии. */
    lines: new Map<Figure, FPoint>(),

    target: undefined as Figure | undefined,

    has(node: MkNode): boolean {
      return this.group.allNodes.includes(node);
    },

    adjust(figure?: Figure) {
      for (const c of [...this.group.children]) c.destroy();

      this.points.clear();
      this.curvesAfter.clear();
      this.curvesBefore.clear();
      this.lines.clear();

      this.target = figure;

      if (!figure) return;

      const at = figure.absoluteTransform;
      const { x, y } = at.decompose();

      // Сперва создаем соединительные линии.

      for (const p of figure.lines.points) {
        if (!p.parentPoint) continue;

        const l = Object.assign(new Figure(), {
          interactive: false, // TODO:
          points: FPoint.createLine(
            x + p.parentPoint.x,
            y + p.parentPoint.y,
            x + p.x,
            y + p.y
          ),
        });

        this.lines.set(l, p);
        l.moveTo(this.group);
      }

      // Поверх линий накладываем трансформеры.

      for (const p of figure.points) {
        if (p.xAfter && p.yAfter) {
          const ac = Object.assign(new Figure(), {
            points: FPoint.createRect(0, 0, 3, 3),
            x: x + p.x + p.xAfter - 1.5,
            y: y + p.y + p.yAfter - 1.5,
          });

          this.curvesAfter.set(ac, p);
          ac.moveTo(this.group);
        }

        if (p.xBefore && p.yBefore) {
          const bc = Object.assign(new Figure(), {
            points: FPoint.createRect(0, 0, 3, 3),
            x: x + p.x + p.xBefore - 1.5,
            y: y + p.y + p.yBefore - 1.5,
          });

          this.curvesBefore.set(bc, p);
          bc.moveTo(this.group);
        }
      }

      for (const p of figure.points) {
        const t = Object.assign(new Figure(), {
          points: FPoint.createRect(0, 0, 6, 6),
          x: x + p.x - 3,
          y: y + p.y - 3,
        });

        this.points.set(t, p);
        t.moveTo(this.group);
      }

      console.log(this);
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

        Object.assign(l.points[0], {
          x: x + p.parentPoint!.x,
          y: y + p.parentPoint!.y,
        });

        Object.assign(l.points[1], {
          x: x + p.x,
          y: y + p.y,
        });

        Object.assign(l, {
          x: 0,
          y: 0,
        });
      }

      // Кривые до

      for (const ac of this.curvesAfter.keys()) {
        const p = this.curvesAfter.get(ac);

        if (!p) continue;

        Object.assign(ac, {
          x: x + p.x + p.xAfter - 1.5,
          y: y + p.y + p.yAfter - 1.5,
        });
      }

      // Кривые после

      for (const ab of this.curvesBefore.keys()) {
        const p = this.curvesBefore.get(ab);

        if (!p) continue;

        Object.assign(ab, {
          x: x + p.x + p.xBefore - 1.5,
          y: y + p.y + p.yBefore - 1.5,
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
    },

    moveControlBy(node: MkNode, dx: number, dy: number) {
      const point = this.points.get(node as Figure);
      const curveAfter = this.curvesAfter.get(node as Figure);
      const curveBefore = this.curvesBefore.get(node as Figure);

      if (curveAfter) {
        curveAfter.xAfter += dx;
        curveAfter.yAfter += dy;
      } else if (curveBefore) {
        curveBefore.xBefore += dx;
        curveBefore.yBefore += dy;
      } else if (point) {
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
  },
  {
    adjust: action,
    moveControlBy: action,
    realign: action,
  }
);
