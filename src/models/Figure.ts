import { action, computed, makeObservable, observable } from "mobx";
import { Primitive } from "./Primitive";

export class FPoint {
  @observable public parentPoint?: FPoint = undefined;

  @observable public x: number = 0;
  @observable public y: number = 0;

  @observable public xBefore: number = 0;
  @observable public yBefore: number = 0;
  @observable public xAfter: number = 0;
  @observable public yAfter: number = 0;

  // TODO: corner radius

  constructor(
    x: number,
    y: number,
    xAfter: number = 0,
    yAfter: number = 0,
    xBefore?: number,
    yBefore?: number,
    parentPoint?: FPoint
  ) {
    this.parentPoint = parentPoint;

    this.x = x;
    this.y = y;

    this.xAfter = xAfter;
    this.yAfter = yAfter;
    this.xBefore = xBefore === undefined ? -xAfter : 0;
    this.yBefore = yBefore === undefined ? -yAfter : 0;

    makeObservable(this);
  }

  /** Все точки по связям. */
  @computed public get allPoints(): FPoint[] {
    const result: FPoint[] = [];
    let lookup: FPoint | undefined = this;

    while (lookup) {
      if (result.includes(lookup)) break;

      result.push(lookup);
      lookup = lookup.parentPoint;
    }

    return result;
  }

  /**
   * Присоединяет себя к начальной точке.
   *
   * @param parent Родительская точка.
   */
  public after(parent: FPoint) {
    this.parentPoint = parent;

    return this;
  }

  /**
   * Присоединяет продолжающие точки и возвращает себя.
   *
   * @param children Присоединяемые точки.
   */
  public before(...children: FPoint[]) {
    for (const child of children) {
      child.parentPoint = this;
    }

    return this;
  }

  /**
   * Присоединяет точку и возвращает ее.
   *
   * @param next Присоединяемая точка.
   */
  public next(next: FPoint) {
    next.parentPoint = this;

    return next;
  }

  /**
   * Замыкает текущую точку на Еву.
   */
  public loop() {
    const checked: FPoint[] = [this];
    let lookup = this.parentPoint;

    while (lookup) {
      if (checked.includes(lookup)) break;

      if (!lookup.parentPoint) {
        lookup.parentPoint = this;
        break;
      }

      checked.push(lookup);
      lookup = lookup.parentPoint;
    }

    return this;
  }
}

export enum StrokeStyle {
  Solid = 1,
  Dash,
}

export class Figure extends Primitive {
  public static createLine(
    ax: number,
    ay: number,
    bx: number,
    by: number
  ): FPoint[] {
    return new FPoint(ax, ay).next(new FPoint(bx, by)).allPoints;
  }

  public static createRect(
    x: number,
    y: number,
    w: number,
    h: number
  ): FPoint[] {
    return new FPoint(x, y)
      .next(new FPoint(x + w, y))
      .next(new FPoint(x + w, y + h))
      .next(new FPoint(x, y + h))
      .loop().allPoints;
  }

  public name: string = "Figure";

  @observable public points: FPoint[] = [];
  @observable public backgroundColor: string = "#AAAAAA";
  @observable public strokeColor: string = "#000000";
  @observable public strokeWidth: number = 1;
  @observable public strokeStyle: StrokeStyle = StrokeStyle.Solid;
  @observable public strokeDash: number = 10;
  @observable public strokeDashGap?: number = undefined;

  constructor() {
    super();

    makeObservable(this);

    // observe(this, "pathData", () => this.adjustPointsAndSize());
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

    this.width = xMax - xMin;
    this.height = yMax - yMin;
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
