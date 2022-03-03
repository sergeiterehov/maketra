import { intercept, makeObservable, observable } from "mobx";
import { Group } from "./Group";
import { Constraint, Size } from "./MkNode";

export class Area extends Group {
  public name: string = "Area";

  public width: number = 0;
  public height: number = 0;

  @observable public clipContent: boolean = true;
  @observable public backgroundColor: string = "#FFFFFF";

  get size(): Size {
    return { width: this.width, height: this.height };
  }

  constructor() {
    super();

    makeObservable(this);

    intercept(this, (change) => {
      if (change.type !== "update") return change;

      if (!(change.name === "width" || change.name === "height")) return change;

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
    const { width, height, backgroundColor } = this;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

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
