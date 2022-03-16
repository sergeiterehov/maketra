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
  public static debug = false;

  public name: string = "Figure";

  @observable public points: FPoint[] = [];
  @observable public cornerRadius: number = 0;
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
}
