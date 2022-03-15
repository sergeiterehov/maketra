import { action, observable } from "mobx";
import { MkNode } from "./models/MkNode";

export const editorState = observable(
  {
    selected: undefined as MkNode | undefined,

    select(node?: MkNode) {
      this.selected = node;

      return this;
    },
  },
  {
    select: action,
  }
);
