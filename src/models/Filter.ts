import { makeObservable, observable } from "mobx";
import { Color } from "../utils/Color";

export abstract class Filter {
  @observable public disabled: boolean = false;

  constructor() {
    makeObservable(this);
  }
}

export class BlurFilter extends Filter {
  @observable public radius: number;

  constructor(radius: number = 4) {
    super();

    this.radius = radius;

    makeObservable(this);
  }
}

export class DropShadowFilter extends Filter {
  @observable public x: number;
  @observable public y: number;
  @observable public radius: number;
  @observable public color: Color;

  constructor(
    x: number = 0,
    y: number = 5,
    radius: number = 4,
    color: Color = new Color({ hex: "#0004" })
  ) {
    super();

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    makeObservable(this);
  }
}
