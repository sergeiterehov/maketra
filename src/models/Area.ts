import { intercept, makeObservable, observable } from "mobx";
import { ColorFill } from "./Fill";
import { Group } from "./Group";
import { Constraint, Size } from "./MkNode";

export class Area extends Group {
  public name: string = "Area";

  public width: number = 0;
  public height: number = 0;

  @observable public clipContent: boolean = true;

  get size(): Size {
    return { width: this.width, height: this.height };
  }

  constructor() {
    super();

    const baseFill = new ColorFill();

    baseFill.color = "#FFF";
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

  protected clip(ctx: CanvasRenderingContext2D) {
    const { width, height, clipContent } = this;

    if (clipContent) {
      const clip = new Path2D();

      clip.rect(0, 0, width, height);

      ctx.clip(clip);
    }
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    for (const fill of this.fills) {
      fill.apply(ctx);
      ctx.fill();
    }

    if (!this.parentNode) {
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.font = "14px monospace";
      ctx.fillText(this.name, 0, -8);
    }

    this.clip(ctx);
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.fillRect(0, 0, width, height);

    this.clip(ctx);
  }
}
