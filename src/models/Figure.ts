import {
  action,
  computed,
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

      // Нельзя допустить установки нулевых значений.
      if (change.newValue === 0) {
        change.newValue = 1;
      }

      const isWidth = change.name === "width";
      const diff = change.newValue - change.object[change.name];

      for (const point of this.points) {
        if (isWidth) {
          const k = diff / (this.width || 1);

          point.x += k * point.x;
          point.xAfter += k * point.xAfter;
          point.xBefore += k * point.xBefore;
        } else {
          const k = diff / (this.height || 1);

          point.y += k * point.y;
          point.yAfter += k * point.yAfter;
          point.yBefore += k * point.yBefore;
        }
      }

      return change;
    });
  }

  /**
   * Возвращает набор точек в правильном порядке рисования.
   * Линия рисуется от родителя к точке. Если нет родителя, это старт.
   *
   * Проверяет и возвращает замкнутость фигуры. TODO: вынести в отдельный get.
   */
  @computed public get lines(): { points: FPoint[]; isClosed: boolean } {
    let isClosed = false;
    const points: FPoint[] = [];

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

      points.push(p);

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

    return { points, isClosed };
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
    this.x += x;
    this.y += y;
    this.lockScaleOnResize = false;
  }

  protected renderPathData(ctx: CanvasRenderingContext2D): void {
    if (!this.points.length) return;

    ctx.beginPath();

    const { isClosed, points } = this.lines;

    if (!points.length) return;

    // Если это замкнутая фигура, то нужно сперва перейти
    if (points[0].parentPoint) {
      ctx.moveTo(points[0].parentPoint.x, points[0].parentPoint.y);
    }

    for (const p of points) {
      if (p.parentPoint) {
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
