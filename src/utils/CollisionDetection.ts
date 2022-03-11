import { FLink, FPoint } from "../models/FPoint";
import { Vector2d } from "./Transform";

export class CollisionDetection {
  static infinity = 999999999;

  static vector2(
    a1: Vector2d,
    a2: Vector2d,
    b1: Vector2d,
    b2: Vector2d
  ): Vector2d | void {
    const x1 = a1.x;
    const x2 = a2.x;
    const x3 = b1.x;
    const x4 = b2.x;
    const y1 = a1.y;
    const y2 = a2.y;
    const y3 = b1.y;
    const y4 = b2.y;

    const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / D;
    const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / D;

    if (u < 0 || u > 1 || t < 0 || t > 1) return;

    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);

    return { x, y };
  }

  static link2(a: FLink, b: FLink): Vector2d | void {
    // * Считаем что координаты не будут одинаковыми
    if (a === b) return;

    return this.vector2(a.a, a.b, b.a, b.b);
  }

  static links(links: FLink[]): Vector2d[][] {
    // * Считаем что ссылки не повторяются
    const intersections: Vector2d[][] = [];

    for (let i = 0; i < links.length; i += 1) {
      intersections.push([]);
    }

    for (let ia = 0; ia < links.length; ia += 1) {
      for (let ib = ia + 1; ib < links.length; ib += 1) {
        const a = links[ia];
        const b = links[ib];

        // Пропускаем связанные точки
        if (a.a === b.a || a.a === b.b || a.b === b.a || a.b === b.b) continue;

        const intersection = this.vector2(a.a, a.b, b.a, b.b);

        if (intersection) {
          intersections[ia][ib] = intersection;
        }
      }
    }

    return intersections;
  }

  static isPointInPath(point: Vector2d, path: Vector2d[]): boolean {
    // * Считаем что путь замкнутый и без локальных петель.
    // * Считаем, что у нас кольцо [1, 2, 3, ...., 1].
    const pointToInf: Vector2d = { x: this.infinity, y: point.y };

    let counter = 0;

    // Начинаем с 1, так как кольцо.
    for (let i = 1; i < path.length; i += 1) {
      const intersection = this.vector2(
        point,
        pointToInf,
        path[i - 1],
        path[i]
      );

      if (intersection) {
        counter += 1;
      }
    }

    return counter % 2 !== 0;
  }
}
