import { makeObservable, observable } from "mobx";

export enum StrokeStyle {
  Solid = 1,
  Dash,
}

export class Stroke {
  @observable public color: string = "#000";
  @observable public width: number = 1;
  @observable public style: StrokeStyle = StrokeStyle.Solid;
  @observable public dash: number = 10;
  @observable public dashGap?: number = undefined;

  constructor(
    style: StrokeStyle = StrokeStyle.Solid,
    width: number = 1,
    color: string = "#000",
    dash: number = 10
  ) {
    this.style = style;
    this.width = width;
    this.color = color;
    this.dash = dash;

    makeObservable(this);
  }
}
