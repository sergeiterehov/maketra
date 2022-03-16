import { action, makeObservable, observable } from "mobx";
import { Vector2d } from "../utils/Transform";

export enum BlendMode {
  Color = "color",
  ColorBurn = "color-burn",
  ColorDodge = "color-dodge",
  Copy = "copy",
  Darken = "darken",
  DestinationAtop = "destination-atop",
  DestinationIn = "destination-in",
  DestinationOut = "destination-out",
  DestinationOver = "destination-over",
  Difference = "difference",
  Exclusion = "exclusion",
  HardLight = "hard-light",
  Hue = "hue",
  Lighten = "lighten",
  Lighter = "lighter",
  Luminosity = "luminosity",
  Multiply = "multiply",
  Overlay = "overlay",
  Saturation = "saturation",
  Screen = "screen",
  SoftLight = "soft-light",
  SourceAtop = "source-atop",
  SourceIn = "source-in",
  SourceOut = "source-out",
  SourceOver = "source-over",
  Xor = "xor",
  Normal = SourceOver,
}

export abstract class Fill {
  @observable public blendMode?: BlendMode;

  constructor() {
    makeObservable(this);
  }
}

export class ColorFill extends Fill {
  @observable public color: string;

  constructor(color: string = "#0008") {
    super();

    this.color = color;

    makeObservable(this);
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
    this.stops.push({ offset, color });

    return this;
  }
}
