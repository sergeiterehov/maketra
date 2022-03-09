import {
  action,
  computed,
  intercept,
  makeObservable,
  observable,
  observe,
} from "mobx";
import { FLink, FPoint } from "./FPoint";
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

      let dx = 0;
      let dy = 0;

      if (isWidth) {
        dx = diff;
      } else {
        dy = diff;
      }

      const changedLinks: FLink[] = [];

      for (const point of this.points) {
        const kx = dx / (this.width || 1);
        const ky = dy / (this.height || 1);

        point.x += kx * point.x;
        point.y += ky * point.y;

        for (const link of point.links) {
          if (!changedLinks.includes(link)) {
            link.aControl.x += kx * link.aControl.x;
            link.aControl.y += ky * link.aControl.y;
          }
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

    if (!points.length) return;

    // TODO: drawing

    const reserved: FPoint[] = [...this.points];
    const paths: FPoint[][] = [];

    function pass(point: FPoint, from?: FPoint, path: FPoint[] = []) {
      path.push(point);
      reserved.splice(reserved.indexOf(point), 1);

      const linked = point.linkedPoints;

      for (const next of linked) {
        // Пропускам связи к предыдущей точке.
        if (from === next) {
          // Но если нет других связей, то это конец пути.
          if (linked.length === 1) {
            paths.push(path);

            break;
          }

          continue;
        }

        const branchPath = [...path];

        if (path.includes(next)) {
          // Фигура замкнулась
          // TODO: Нужно отделить линию до цикла!
          branchPath.push(next);
          paths.push(branchPath);
        } else if (reserved.includes(next)) {
          pass(next, point, branchPath);
        }
      }
    }

    for (let i = 0; i < reserved.length; i += 1) {
      pass(reserved[i]);
    }

    for (const path of paths) {
      ctx.beginPath();

      const start = path.pop()!;

      ctx.moveTo(start.x, start.y);

      for (const point of path) {
        ctx.lineTo(point.x, point.y);
      }

      const end = path.shift();

      if (start === end) {
        ctx.closePath();
      }

      final();
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
