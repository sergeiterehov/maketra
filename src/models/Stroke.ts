import { makeObservable, observable } from "mobx";
import { Color } from "../utils/Color";

export enum StrokeStyle {
  Solid = 1,
  Dash,
  Custom,
}

export class Stroke {
  @observable public disabled: boolean = false;

  @observable public color: Color;
  @observable public width: number = 1;
  @observable public style: StrokeStyle = StrokeStyle.Solid;
  @observable public dashArray: number[] = [10];

  constructor(
    style: StrokeStyle = StrokeStyle.Solid,
    width: number = 1,
    color: Color = new Color({ hex: "#000" }),
    dash: number = 10
  ) {
    this.style = style;
    this.width = width;
    this.color = color;
    this.dashArray = [dash];

    makeObservable(this);
  }
}
