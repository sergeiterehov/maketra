import { makeObservable, observable } from "mobx";
import { MkNode } from "./MkNode";

export enum StrokeStyle {
  Solid = 1,
  Dash,
}

export class Primitive extends MkNode {
  public name: string = "Primitive";

  @observable public cornerRadius: number = 0;
  @observable public strokeColor: string = "#000000";
  @observable public strokeWidth: number = 1;
  @observable public strokeStyle: StrokeStyle = StrokeStyle.Solid;
  @observable public strokeDash: number = 10;
  @observable public strokeDashGap?: number = undefined;

  constructor() {
    super();

    makeObservable(this);
  }
}
