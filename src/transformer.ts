import { makeAutoObservable, observe, runInAction } from "mobx";
import { Figure } from "./models/Figure";
import { Group } from "./models/Group";
import { MkNode } from "./models/MkNode";

const transformerGroup = Object.assign(new Group(), {
  name: "Transformer",
  x: 0,
  y: 0,
}).add(
  Object.assign(new Figure(), {
    name: "T",
    path: `M 0,0 l ${10},0`,
    strokeColor: "#00F",
  }),
  Object.assign(new Figure(), {
    name: "B",
    y: 10,
    path: `M 0,0 l ${10},0`,
    strokeColor: "#00F",
  }),
  Object.assign(new Figure(), {
    name: "L",
    path: `M 0,0 l 0,${10}`,
    strokeColor: "#00F",
  }),
  Object.assign(new Figure(), {
    name: "R",
    x: 10,
    path: `M 0,0 l 0,${10}`,
    strokeColor: "#00F",
  }),
  Object.assign(new Figure(), {
    name: "TL",
    path: "M -3,-3 l 5,0 l 0,5 l -5,0 z",
  }),
  Object.assign(new Figure(), {
    name: "BR",
    x: 10,
    y: 10,
    path: "M -3,-3 l 5,0 l 0,5 l -5,0 z",
  }),
  Object.assign(new Figure(), {
    name: "BL",
    y: 10,
    path: "M -3,-3 l 5,0 l 0,5 l -5,0 z",
  }),
  Object.assign(new Figure(), {
    name: "TR",
    x: 10,
    path: "M -3,-3 l 5,0 l 0,5 l -5,0 z",
  })
);

export const transformer = makeAutoObservable({
  x: 0,
  y: 0,
  width: 0,
  height: 0,

  group: transformerGroup,
  nodes: Object.fromEntries(
    transformerGroup.children.map((child) => [child.name, child])
  ) as Record<"T" | "B" | "L" | "R" | "TR" | "TL" | "BL" | "BR", Figure>,

  adjust(node: MkNode) {
    const at = node.absoluteTransform;
    const { width, height } = node.size;
    const { x, y } = at.decompose();

    runInAction(() => {
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
    });
  },
});

observe(transformer, () => {
  runInAction(() => {
    const { x, y, width, height, group } = transformer;
    const { T, L, R, B, TL, BR, TR, BL } = transformer.nodes;

    group.x = x;
    group.y = y;

    T.path = `M 0,0 l ${width},0`;

    B.y = height;
    B.path = `M 0,0 l ${width},0`;

    L.path = `M 0,0 l 0,${height}`;

    R.x = width;
    R.path = `M 0,0 l 0,${height}`;

    // TL maintain

    BR.x = width;
    BR.y = height;

    BL.y = height;

    TR.x = width;
  });
});
