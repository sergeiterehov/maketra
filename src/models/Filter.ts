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
