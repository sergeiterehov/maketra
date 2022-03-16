import { action, observable } from "mobx";
import { MkNode } from "./models/MkNode";
import { Transform } from "./utils/Transform";

export const editorState = observable(
  {
    selected: undefined as MkNode | undefined,
    pixelRatio: devicePixelRatio,
    baseTransform: new Transform().scale(devicePixelRatio, devicePixelRatio),

    select(node?: MkNode) {
      this.selected = node;

      return this;
    },
  },
  {
    select: action,
  }
);
