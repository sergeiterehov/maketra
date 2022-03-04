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
    /** Соответствие точке трансформерам */
    transformers: new Map<FPoint, Figure>(),

    adjust(figure?: Figure) {
      for (const t of Array.from(this.transformers.values())) {
        t.destroy();
      }

      this.transformers.clear();

      if (!figure) return;

      const at = figure.absoluteTransform;
      const { x, y } = at.decompose();

      for (const point of figure.points) {
        const tFigure = Object.assign(new Figure(), {
          points: FPoint.createRect(0, 0, 6, 6),
          x: x + point.x - 3,
          y: y + point.y - 3,
        });

        this.transformers.set(point, tFigure);
        tFigure.moveTo(this.group);
      }
    },
  },
  {
    adjust: action,
  }
);
