import {
  action,
  intercept,
  makeObservable,
  observable,
  observe,
} from "mobx";
import { FPoint } from "./FPoint";
import { Primitive } from "./Primitive";

export enum StrokeStyle {
  Solid = 1,
  Dash,
}

export class Figure extends Primitive {
  public name: string = "Figure";

  @observable public points: FPoint[] = [];
  @observable public backgroundColor: string = "#AAAAAA";
  @observable public strokeColor: string = "#000000";
  @observable public strokeWidth: number = 1;
  @observable public strokeStyle: StrokeStyle = StrokeStyle.Solid;
  @observable public strokeDash: number = 10;
  @observable public strokeDashGap?: number = undefined;

  /** Блокирует автоматическое масштабирование точек при изменении размеров. */
  private lockScaleOnResize = false;

  constructor() {
    super();

    makeObservable(this);

    observe(this, "points", () => this.adjustPointsAndSize());

    intercept(this, (change) => {
      if (this.lockScaleOnResize) return change;

      if (change.type !== "update") return change;

      if (!(change.name === "width" || change.name === "height")) return change;

      const isWidth = change.name === "width";
      const diff = change.newValue - change.object[change.name];

      for (const point of this.points) {
        if (isWidth) {
          point.x += diff * point.x / (this.width || 1);
        } else {
          point.y += diff * point.y / (this.height || 1);
        }
      }

      return change;
    });
  }

  @action
  protected adjustPointsAndSize() {
    let xMin = +Infinity;
    let yMin = +Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;

    for (const p of this.points) {
      if (p.x < xMin) xMin = p.x;
      if (p.x > xMax) xMax = p.x;
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    }

    const x = xMin;
    const y = yMin;

    if (x || y) {
      for (const p of this.points) {
        p.x -= x;
        p.y -= y;
      }
    }

    // Блокируем масштабирование точек, потому что адаптируемся под них.
    this.lockScaleOnResize = true;
    this.width = xMax - xMin;
    this.height = yMax - yMin;
    this.lockScaleOnResize = false;
  }

  protected renderPathData(ctx: CanvasRenderingContext2D): void {
    let isClosed = false;

    ctx.beginPath();

    const reserve: FPoint[] = [];
    const pool: FPoint[] = [];

    for (const p of this.points) {
      if (!p.parentPoint) {
        pool.push(p);
      } else {
        reserve.push(p);
      }
    }

    // Если нет ни одной начальной точки, то это замкнутая фигура.
    if (this.points.length && !pool.length) {
      isClosed = true;
      // Можно начать рисование с любой точки.
      pool.push(reserve.pop()!);
    }

    while (pool.length) {
      const p = pool.pop()!;

      if (p.parentPoint) {
        // Фигура не замкнется, если делать перемещения.
        if (!isClosed) ctx.moveTo(p.parentPoint.x, p.parentPoint.y);

        // Можно рисовать lineTo для отображения скелета.
        ctx.bezierCurveTo(
          p.parentPoint.x + p.parentPoint.xAfter,
          p.parentPoint.y + p.parentPoint.yAfter,
          p.x + p.xBefore,
          p.y + p.yBefore,
          p.x,
          p.y
        );
      } else {
        ctx.moveTo(p.x, p.y);
      }

      // Далее находим связанные с текущей точки.
      for (let i = 0; i < reserve.length; i += 1) {
        const other = reserve[i];

        if (other.parentPoint === p) {
          pool.push(other);
          // Удаляем из резерва.
          reserve.splice(i, 1);
          i -= 1;
          continue;
        }
      }
    }

    if (isClosed) {
      ctx.closePath();
      ctx.fill();
    }
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    const {
      backgroundColor,
      strokeStyle,
      strokeWidth,
      strokeColor,
      strokeDash,
      strokeDashGap,
    } = this;

    ctx.fillStyle = backgroundColor;

    this.renderPathData(ctx);

    if (strokeWidth) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;

      if (strokeStyle === StrokeStyle.Dash) {
        ctx.setLineDash([strokeDash, strokeDashGap ?? strokeDash]);
      }

      ctx.stroke();
    }
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    this.renderPathData(ctx);

    ctx.lineWidth = 8;
    ctx.stroke();
  }
}
