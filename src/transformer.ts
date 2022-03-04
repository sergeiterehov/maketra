import { action, makeAutoObservable, observe } from "mobx";
import { Figure, StrokeStyle } from "./models/Figure";
import { Group } from "./models/Group";
import { Constraint, MkNode } from "./models/MkNode";

const borderColor = "#00F";
const constraintColor = "#00F6";
const cornerColor = "#FFF";

const cornerSize: number = 6;
const cornerOffset = -cornerSize / 2;

const borderProps: Partial<Figure> = {
  path: `M 0,0 l 0,0`,
  strokeColor: borderColor,
};

const cornerProps: Partial<Figure> = {
  x: cornerOffset,
  y: cornerOffset,
  path: `M 0,0 l ${cornerSize},0 l 0,${cornerSize} l ${-cornerSize},0 z`,
  strokeColor: borderColor,
  backgroundColor: cornerColor,
};

const constraintProps: Partial<Figure> = {
  interactive: false,
  path: `M 0,0 l 0,0`,
  strokeStyle: StrokeStyle.Dash,
  strokeDash: 5,
  strokeColor: constraintColor,
}

const transformerGroup = Object.assign(new Group(), { name: "Transformer" }).add(
  // Грани
  Object.assign(new Figure(), borderProps, { name: "T" }),
  Object.assign(new Figure(), borderProps, { name: "B" }),
  Object.assign(new Figure(), borderProps, { name: "L" }),
  Object.assign(new Figure(), borderProps, { name: "R" }),
  // Углы
  Object.assign(new Figure(), cornerProps, { name: "TL" }),
  Object.assign(new Figure(), cornerProps, { name: "BR" }),
  Object.assign(new Figure(), cornerProps, { name: "BL" }),
  Object.assign(new Figure(), cornerProps, { name: "TR" }),
  // Ограничения
  Object.assign(new Figure(), constraintProps, { name: "CV" }),
  Object.assign(new Figure(), constraintProps, { name: "CH" })
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

    adjust(node: MkNode) {
      if (lockAdjustment) return this;

      const { width, height } = node.size;
      const at = node.absoluteTransform;
      const { x, y } = at.decompose();

      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;

      this.target = node;
      this.relative = node.parentNode;

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

      T.path = `M 0,0 l ${width},0`;

      B.y = height;
      B.path = `M 0,0 l ${width},0`;

      L.path = `M 0,0 l 0,${height}`;

      R.x = width;
      R.path = `M 0,0 l 0,${height}`;

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
            CH.path = `M 0,0 l ${dx},0`;
            break;
          case Constraint.Right:
            CH.x = width;
            CH.path = `M ${rw - width - dx},0 L 0,0`;
            break;
          case Constraint.Center:
            CH.x = -dx;
            CH.path = `M 0,0 l ${rw},0`;
            break;
          default:
            CH.path = "";
        }

        switch (target.verticalConstraint) {
          case Constraint.Top:
            CV.y = -dy;
            CV.path = `M 0,0 l 0,${dy}`;
            break;
          case Constraint.Right:
            CV.y = height;
            CV.path = `M 0,${rh - height - dy} L 0,0`;
            break;
          case Constraint.Center:
            CV.y = -dy;
            CV.path = `M 0,0 l 0,${rh}`;
            break;
          default:
            CH.path = "";
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
