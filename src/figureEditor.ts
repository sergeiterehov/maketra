import { action, observable } from "mobx";
import { Figure } from "./models/Figure";
import { FPoint } from "./models/FPoint";
import { Group } from "./models/Group";

const figureEditorGroup = Object.assign(new Group(), { name: "FigureEdit" });

// TODO:
figureEditorGroup.interactive = false;

export const figureEditor = observable(
  {
    group: figureEditorGroup,
    /** Соответствие точке трансформерам. */
    points: new Map<FPoint, Figure>(),
    /** Трансформеры кривых. */
    curves: [] as Figure[],
    /** Соединяющие линии. */
    lines: [] as Figure[],

    adjust(figure?: Figure) {
      for (const t of Array.from(this.points.values())) {
        t.destroy();
      }

      this.points.clear();

      for (const c of this.curves) {
        c.destroy();
      }

      this.curves.splice(0, this.curves.length);

      for (const l of this.lines) {
        l.destroy();
      }

      this.lines.splice(0, this.lines.length);

      if (!figure) return;

      const at = figure.absoluteTransform;
      const { x, y } = at.decompose();

      // Сперва создаем соединительные линии.

      for (const p of figure.lines.points) {
        if (!p.parentPoint) continue;

        const l = Object.assign(new Figure(), {
          points: FPoint.createLine(
            x + p.parentPoint.x,
            y + p.parentPoint.y,
            x + p.x,
            y + p.y
          ),
        });

        this.lines.push(l);
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

          this.curves.push(ac);
          ac.moveTo(this.group);
        }

        if (p.xBefore && p.yBefore) {
          const bc = Object.assign(new Figure(), {
            points: FPoint.createRect(0, 0, 3, 3),
            x: x + p.x + p.xBefore - 1.5,
            y: y + p.y + p.yBefore - 1.5,
          });

          this.curves.push(bc);
          bc.moveTo(this.group);
        }
      }

      for (const p of figure.points) {
        const t = Object.assign(new Figure(), {
          points: FPoint.createRect(0, 0, 6, 6),
          x: x + p.x - 3,
          y: y + p.y - 3,
        });

        this.points.set(p, t);
        t.moveTo(this.group);
      }
    },
  },
  {
    adjust: action,
  }
);
