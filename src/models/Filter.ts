import { makeObservable, observable } from "mobx";

export abstract class Filter {
  constructor() {
    makeObservable(this);
  }

  protected addFilter(ctx: CanvasRenderingContext2D, filter: string) {
    ctx.filter = `${ctx.filter.replace("none", "")} ${filter}`;

    return this;
  }

  public abstract apply(ctx: CanvasRenderingContext2D): void;
}

export class BlurFilter extends Filter {
  @observable public radius: number;

  constructor(radius: number = 4) {
    super();

    this.radius = radius;

    makeObservable(this);
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    this.addFilter(ctx, `blur(${this.radius}px)`);
  }
}

export class DropShadowFilter extends Filter {
  @observable public x: number;
  @observable public y: number;
  @observable public radius: number;
  @observable public color: string;

  constructor(
    x: number = 0,
    y: number = 5,
    radius: number = 4,
    color: string = "#0004"
  ) {
    super();

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    makeObservable(this);
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    const { x, y, radius, color } = this;
    this.addFilter(ctx, `drop-shadow(${x}px ${y}px ${radius}px ${color})`);
  }
}
