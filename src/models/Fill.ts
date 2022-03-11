import { action, makeObservable, observable } from "mobx";
import { Vector2d } from "../utils/Transform";

export abstract class Fill {
  constructor() {
    makeObservable(this);
  }

  public abstract apply(ctx: CanvasRenderingContext2D): void;
}

export class ColorFill extends Fill {
  @observable public color: string;

  constructor(color: string = "#0008") {
    super();

    this.color = color;

    makeObservable(this);
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
  }
}

export interface ILinearGradientFillStop {
  offset: number;
  color: string;
}

export class LinearGradientFill extends Fill {
  @observable public a: Vector2d;
  @observable public b: Vector2d;

  @observable public stops: ILinearGradientFillStop[];

  constructor(
    a: Vector2d = { x: 0, y: 0 },
    b: Vector2d = { x: 0, y: 100 },
    stops: ILinearGradientFillStop[] = [
      { offset: 0, color: "#000" },
      { offset: 1, color: "#0000" },
    ]
  ) {
    super();

    this.a = a;
    this.b = b;
    this.stops = stops;

    makeObservable(this);
  }

  @action
  public clear() {
    this.stops.splice(0);

    return this;
  }

  @action
  public add(offset: number, color: string) {
    this.stops.push({offset, color});

    return this;
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    const { a, b, stops } = this;

    const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);

    for (const stop of stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }

    ctx.fillStyle = gradient;
  }
}
