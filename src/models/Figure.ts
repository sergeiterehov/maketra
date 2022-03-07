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

export interface PointTriad {
  from_p?: FPoint;
  p: FPoint;
  p_to?: FPoint;
}

export class Figure extends Primitive {
  public name: string = "Figure";

  @observable public points: FPoint[] = [];
  @observable public cornerRadius: number = 0;
  @observable public backgroundColor?: string = "#AAAAAA";
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
  @computed public get triads(): PointTriad[] {
    const { points } = this;

    const triads: PointTriad[] = [];

    const probEntryPoints = [...points];
    const entryPoints: FPoint[] = [];

    while (probEntryPoints.length) {
      const probEntry = probEntryPoints.pop()!;

      // идем к началу или к самому себе
    }

    return triads;
  }

  @action
  public adjustPointsAndSize() {
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

  protected renderPathData(
    ctx: CanvasRenderingContext2D,
    final: () => void
  ): void {
    const { points, cornerRadius } = this;

    if (!points) return;

    // TODO: drawing

    const drawn: FPoint[] = [];
    const willPass: FPoint[] = [points[0]]; // TODO: each entry point

    function pass(p: FPoint) {
      if (drawn.includes(p)) {
        ctx.closePath();
        return;
      }

      drawn.push(p);

      if (p.links.length === 2) {
        const [a, b] = p.links;
        const p_to = drawn.includes(a) ? b : a;
        const from_p = p_to === a ? b : a;

        if (!drawn.includes(from_p)) {
          ctx.moveTo(from_p.x, from_p.y);
        }

        ctx.arcTo(p.x, p.y, p_to.x, p_to.y, cornerRadius);

        pass(p_to);
      }
    }

    for (const p of willPass) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);

      pass(p);
      final();
    }

    if (1 === 1) return;
    drawn.length = 0;

    for (const p of points) {
      for (const from_p of p.links) {
        drawn.push(p);

        if (drawn.includes(from_p)) continue;

        if (cornerRadius && p.links.length === 2) {
          for (const p_to of p.links) {
            if (from_p === p_to || drawn.includes(p_to)) continue;

            ctx.beginPath();
            ctx.moveTo(from_p.x, from_p.y);
            ctx.arcTo(p.x, p.y, p_to.x, p_to.y, cornerRadius);

            final();
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(from_p.x, from_p.y);
          ctx.lineTo(p.x, p.y);

          final();
        }
      }
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

    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
    }

    this.renderPathData(ctx, () => {
      if (this.backgroundColor) ctx.fill();

      if (strokeWidth) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;

        if (strokeStyle === StrokeStyle.Dash) {
          ctx.setLineDash([strokeDash, strokeDashGap ?? strokeDash]);
        }

        ctx.stroke();
      }
    });

    // FIXME:

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.size.width, 0);
    ctx.lineTo(this.size.width, this.size.height);
    ctx.lineTo(0, this.size.height);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#F005";
    ctx.stroke();
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    this.renderPathData(ctx, () => {
      if (this.backgroundColor) ctx.fill();

      ctx.lineWidth = 8;
      ctx.stroke();
    });
  }
}
