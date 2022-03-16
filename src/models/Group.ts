import { makeObservable } from "mobx";
import { MkNode, Size } from "./MkNode";

// TODO: только применяет свойства ко всей группе

export class Group extends MkNode {
  public name: string = "Group";

  constructor() {
    super();

    makeObservable(this);
  }

  public get size(): Size {
    let width = 0;
    let height = 0;

    for (const child of this.children) {
      const { size, x, y } = child;

      width = Math.max(width, x + size.width);
      height = Math.max(height, y + size.height);
    }

    return { width, height };
  }
}
