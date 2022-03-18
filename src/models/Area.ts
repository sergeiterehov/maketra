import { intercept, makeObservable, observable } from "mobx";
import { Color } from "../utils/Color";
import { ColorFill } from "./Fill";
import { Constraint, Size } from "./MkNode";
import { Primitive } from "./Primitive";

export class Area extends Primitive {
  public name: string = "Area";

  public width: number = 0;
  public height: number = 0;

  @observable public clipContent: boolean = true;

  get size(): Size {
    return { width: this.width, height: this.height };
  }

  constructor() {
    super();

    const baseFill = new ColorFill(new Color({ hex: "#FFF" }));

    this.fills.push(baseFill);

    makeObservable(this);

    intercept(this, (change) => {
      if (change.type !== "update") return change;

      if (!(change.name === "width" || change.name === "height")) return change;

      // Нельзя допустить установки нулевых значений.
      if (change.newValue === 0) {
        change.newValue = 1;
      }

      const isWidth = change.name === "width";
      const diff = change.newValue - change.object[change.name];

      for (const child of this.children) {
        const constraint = isWidth
          ? child.horizontalConstraint
          : child.verticalConstraint;
        const propName = isWidth ? "x" : "y";

        if (constraint === Constraint.End) {
          child[propName] += diff;
        } else if (constraint === Constraint.Center) {
          child[propName] += diff / 2;
        } else if (constraint === Constraint.Scale) {
          if (child[change.name] !== undefined) {
            (child[change.name] as number) += diff;
          }
        }
      }

      return change;
    });
  }
}
