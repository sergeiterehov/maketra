import { makeObservable } from "mobx";
import { MkNode } from "./MkNode";

export class Group extends MkNode {
  public name: string = "Group";

  constructor() {
    super();

    makeObservable(this);
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    // not implemented
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    // not implemented
  }
}
