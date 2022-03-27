import { action, makeAutoObservable, observe } from "mobx";
import { Figure } from "./models/Figure";
import { ColorFill } from "./models/Fill";
import { FPoint } from "./models/FPoint";
import { Group } from "./models/Group";
import { Constraint, MkNode } from "./models/MkNode";
import { Stroke, StrokeStyle } from "./models/Stroke";
import { Color } from "./utils/Color";

const borderColor = new Color({ hex: "#00F" });
const constraintColor = new Color({ hex: "#00F6" });
const cornerColor = new Color({ hex: "#FFF" });

const cornerFill = new ColorFill(cornerColor);

const cornerSize: number = 6;
const cornerOffset = -cornerSize / 2;

function getBorderProps(): Partial<Figure> {
  return {
    points: FPoint.createLine(0, 0, 0, 0),
    strokes: [new Stroke(StrokeStyle.Solid, 1, borderColor)],
  };
}

function getCornerProps(): Partial<Figure> {
  return {
    x: cornerOffset,
    y: cornerOffset,
    points: FPoint.createRect(0, 0, cornerSize, cornerSize),
    strokes: [new Stroke(StrokeStyle.Solid, 1, borderColor)],
    fills: [cornerFill],
  };
}

function getConstraintProps(): Partial<Figure> {
  return {
    interactive: false,
    points: FPoint.createLine(0, 0, 0, 0),
    strokes: [new Stroke(StrokeStyle.Dash, 1, constraintColor, 5)],
  };
}

const transformerGroup = Object.assign(new Group(), {
  name: "Transformer",
}).add(
  // Грани
  Object.assign(new Figure(), getBorderProps(), { name: "T" }),
  Object.assign(new Figure(), getBorderProps(), { name: "B" }),
  Object.assign(new Figure(), getBorderProps(), { name: "L" }),
  Object.assign(new Figure(), getBorderProps(), { name: "R" }),
  // Углы
  Object.assign(new Figure(), getCornerProps(), { name: "TL" }),
  Object.assign(new Figure(), getCornerProps(), { name: "BR" }),
  Object.assign(new Figure(), getCornerProps(), { name: "BL" }),
  Object.assign(new Figure(), getCornerProps(), { name: "TR" }),
  // Ограничения
  Object.assign(new Figure(), getConstraintProps(), { name: "CV" }),
  Object.assign(new Figure(), getConstraintProps(), { name: "CH" })
);

let lockAdjustment = false;

export const transformer = makeAutoObservable(
  {
    x: 0,
    y: 0,
    width: 0,
    height: 0,

    target: undefined as MkNode | undefined,
    relative: undefined as MkNode | undefined,

    group: transformerGroup,
    nodes: Object.fromEntries(
      transformerGroup.children.map((child) => [child.name, child])
    ) as Record<
      "T" | "B" | "L" | "R" | "TR" | "TL" | "BL" | "BR" | "CV" | "CH",
      Figure
    >,

    adjust(node?: MkNode) {
      if (lockAdjustment) return this;

      if (node) {
        const { width, height } = node.size;
        const at = node.absoluteTransform;
        const { x, y } = at.decompose();
  
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
  
        this.target = node;
        this.relative = node.parentNode;

        this.group.visible = true;
      } else {
        this.target = undefined;
        this.relative = undefined;

        this.group.visible = false;
      }

      return this;
    },

    applyTo(node: MkNode) {
      const at = node.absoluteTransform;
      const { x, y } = at.decompose();

      lockAdjustment = true;
      node.x += this.x - x;
      node.y += this.y - y;
      node.width = this.width;
      node.height = this.height;
      lockAdjustment = false;

      return this;
    },

    moveControlBy(node: MkNode, dx: number, dy: number) {
      const { T, L, R, B, TL, BR, TR, BL } = transformer.nodes;

      switch (node) {
        case T:
          this.y += dy;
          this.height -= dy;
          break;
        case B:
          this.height += dy;
          break;
        case L:
          this.x += dx;
          this.width -= dx;
          break;
        case R:
          this.width += dx;
          break;
        case TL:
          this.y += dy;
          this.x += dx;
          this.width -= dx;
          this.height -= dy;
          break;
        case BR:
          this.width += dx;
          this.height += dy;
          break;
        case TR:
          this.y += dy;
          this.width += dx;
          this.height -= dy;
          break;
        case BL:
          this.x += dx;
          this.width -= dx;
          this.height += dy;
          break;
      }

      return this;
    },

    has(node: MkNode) {
      return node === this.group || this.group.children.includes(node);
    },

    realign() {
      const { x, y, width, height, group, relative, target } = transformer;
      const { T, L, R, B, TL, BR, TR, BL, CH, CV } = transformer.nodes;

      // Перемещаем группу

      group.x = x;
      group.y = y;

      // Грани

      T.x = 0;
      T.points = FPoint.createLine(0, 0, width, 0);

      B.x = 0;
      B.y = height;
      B.points = FPoint.createLine(0, 0, width, 0);

      L.y = 0;
      L.points = FPoint.createLine(0, 0, 0, height);

      R.y = 0;
      R.x = width;
      R.points = FPoint.createLine(0, 0, 0, height);

      // Углы

      // TL остается на месте

      BR.x = width + cornerOffset;
      BR.y = height + cornerOffset;

      BL.y = height + cornerOffset;

      TR.x = width + cornerOffset;

      // Ограничения

      if (relative && target) {
        const { width: rw, height: rh } = relative.size;
        const at = relative.absoluteTransform;
        const { x: rx, y: ry } = at.decompose();

        const dx = x - rx;
        const dy = y - ry;

        CH.y = height / 2;
        CV.x = width / 2;

        switch (target.horizontalConstraint) {
          case Constraint.Left:
            CH.x = -dx;
            CH.points = FPoint.createLine(0, 0, dx, 0);
            break;
          case Constraint.Right:
            CH.x = width;
            CH.points = FPoint.createLine(rw - width - dx, 0, 0, 0);
            break;
          case Constraint.Center:
            CH.x = -dx;
            CH.points = FPoint.createLine(0, 0, rw, 0);
            break;
          default:
            CH.points = [];
        }

        switch (target.verticalConstraint) {
          case Constraint.Top:
            CV.y = -dy;
            CV.points = FPoint.createLine(0, 0, 0, dy);
            break;
          case Constraint.Right:
            CV.y = height;
            CV.points = FPoint.createLine(0, rh - height - dy, 0, 0);
            break;
          case Constraint.Center:
            CV.y = -dy;
            CV.points = FPoint.createLine(0, 0, 0, rh);
            break;
          default:
            CH.points = [];
        }

        CH.visible = true;
        CV.visible = true;
      } else {
        CH.visible = false;
        CV.visible = false;
      }

      return this;
    },
  },
  {
    adjust: action,
    applyTo: action,
    moveControlBy: action,
    realign: action,
  }
);

observe(transformer, () => transformer.realign());
