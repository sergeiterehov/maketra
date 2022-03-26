import { action, intercept, makeObservable, observable, observe } from "mobx";
import { FLink, FPoint } from "./FPoint";
import { Primitive } from "./Primitive";

export class Figure extends Primitive {
  public static debug = false;

  public name: string = "Figure";

  @observable public points: FPoint[] = [];

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
            link.bControl.x += kx * link.bControl.x;
            link.bControl.y += ky * link.bControl.y;
          }
        }
      }

      return change;
    });
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
