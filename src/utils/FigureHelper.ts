import { FLink, FPoint } from "../models/FPoint";
import { CollisionDetection } from "./CollisionDetection";
import { Vector2d } from "./Transform";

export interface CurvePoints {
  points: Vector2d[];
}

export class FigureHelper {
  static interpolateCurve(
    v0: Vector2d,
    v1: Vector2d,
    v2: Vector2d,
    v3: Vector2d,
    divisions: number = 5
  ) {
    const points: Vector2d[] = [];
    const step = 1 / divisions;

    for (let t = 0; t <= 1; t += step) {
      const k = 1 - t;

      const x =
        k * k * k * v0.x +
        3 * k * k * t * v1.x +
        3 * k * t * t * v2.x +
        t * t * t * v3.x;
      const y =
        k * k * k * v0.y +
        3 * k * k * t * v1.y +
        3 * k * t * t * v2.y +
        t * t * t * v3.y;

      points.push({ x, y });
    }

    return points;
  }

  static lengths(...points: Vector2d[]): number {
    let length = 0;

    for (let i = 1; i < points.length; i += 1) {
      length += Math.hypot(
        points[i].x - points[i - 1].x,
        points[i].y - points[i - 1].y
      );
    }

    return length;
  }

  static interpolateLink(link: FLink, divisions?: number): Vector2d[] {
    const { a, b, aControl, bControl } = link;

    // Оптимизация линейных отрезков
    if (!aControl.x && !aControl.y && !bControl.x && !bControl.y) {
      return [
        { x: a.x, y: a.y },
        { x: b.x, y: b.y },
      ];
    }

    const v0: Vector2d = a;
    const v1: Vector2d = { x: a.x + aControl.x, y: a.y + aControl.y };
    const v2: Vector2d = { x: b.x + bControl.x, y: b.y + bControl.y };
    const v3: Vector2d = b;

    if (!divisions) {
      divisions = this.lengths(...this.interpolateCurve(v0, v1, v2, v3, 5));
    }

    return this.interpolateCurve(v0, v1, v2, v3, divisions);
  }

  static curves(
    points: FPoint[],
    divisions?: number
  ): CurvePoints[] | undefined {
    if (!points.length) return;

    const cloud = [...points].sort((a, b) => a.x - b.x);

    // Убираем все "хвосты".

    const tails: FPoint[] = [];

    for (const point of cloud) {
      if (point.links.length === 1) {
        tails.push(point);
      }
    }

    for (const tail of tails) {
      let point: FPoint | undefined = tail;

      while (point && point.links.length <= 2) {
        if (!cloud.includes(point)) break;

        cloud.splice(cloud.indexOf(point), 1);

        if (point.links.length === 1) {
          point = point.links[0].opposite(point);
        } else if (point.links[0].a === point || point.links[0].b === point) {
          point = point.links[1].opposite(point);
        } else if (point.links[1].a === point || point.links[1].b === point) {
          point = point.links[0].opposite(point);
        } else {
          point = undefined;
        }
      }
    }

    // Собираем все связи

    const links: FLink[] = [];

    for (const point of cloud) {
      for (const link of point.links) {
        if (!links.includes(link)) {
          links.push(link);
        }
      }
    }

    // Интерполируем все связи

    const curves: CurvePoints[] = [];

    for (const link of links) {
      curves.push({ points: this.interpolateLink(link, divisions) });
    }

    // Находим пересечения всех связей со всеми и разделяем кривые

    for (let iac = 0; iac < curves.length; iac += 1) {
      const ac = curves[iac];

      for (let ibc = iac + 1; ibc < curves.length; ibc += 1) {
        const bc = curves[ibc];

        for (let ia = 1; ia < ac.points.length; ia += 1) {
          for (let ib = 1; ib < bc.points.length; ib += 1) {
            if (
              (ac.points[ia].x === bc.points[ib].x &&
                ac.points[ia].y === bc.points[ib].y) ||
              (ac.points[ia].x === bc.points[ib - 1].x &&
                ac.points[ia].y === bc.points[ib - 1].y) ||
              (ac.points[ia - 1].x === bc.points[ib].x &&
                ac.points[ia - 1].y === bc.points[ib].y) ||
              (ac.points[ia - 1].x === bc.points[ib - 1].x &&
                ac.points[ia - 1].y === bc.points[ib - 1].y)
            )
              continue;

            const intersection = CollisionDetection.vector2(
              ac.points[ia],
              ac.points[ia - 1],
              bc.points[ib],
              bc.points[ib - 1]
            );

            if (!intersection) continue;

            const a1 = ac.points.slice(0, ia);
            const a2 = ac.points.slice(ia);
            const b1 = bc.points.slice(0, ib);
            const b2 = bc.points.slice(ib);

            a1.push(intersection);
            a2.unshift(intersection);
            b1.push(intersection);
            b2.unshift(intersection);

            ac.points = a1;
            bc.points = b1;

            curves.push({ points: a2 }, { points: b2 });
          }
        }
      }
    }

    return curves;
  }

  static outlineCurves(curves: CurvePoints): Vector2d[] {
    const outline: Vector2d[] = [];

    // TODO:

    return outline;
  }

  static outline(points: FPoint[], divisions?: number): Vector2d[] | void {
    if (!points.length) return;

    const cloud = [...points].sort((a, b) => a.x - b.x);

    // Убираем все "хвосты".

    const tails: FPoint[] = [];

    for (const point of cloud) {
      if (point.links.length === 1) {
        tails.push(point);
      }
    }

    for (const tail of tails) {
      let point: FPoint | undefined = tail;

      while (point && point.links.length <= 2) {
        if (!cloud.includes(point)) break;

        cloud.splice(cloud.indexOf(point), 1);

        if (point.links.length === 1) {
          point = point.links[0].opposite(point);
        } else if (point.links[0].a === point || point.links[0].b === point) {
          point = point.links[1].opposite(point);
        } else if (point.links[1].a === point || point.links[1].b === point) {
          point = point.links[0].opposite(point);
        } else {
          point = undefined;
        }
      }
    }

    // Начинаем с самой крайней правой точки.
    // Находим связь с минимальным углом и идем по ней.

    // TODO: убрать все точки из пути и повторить для поиска следующей области
    // TODO: передавать уже с точками пересечений

    const start = cloud[cloud.length - 1];

    let pointer: FPoint = start;
    let entryAngle = 180;
    let linkToPointer: FLink | null = null;

    if (!pointer) return;

    const path: Vector2d[] = [];
    const pointsPath: FPoint[] = [];

    while (pointer) {
      if (pointer === start && pointsPath.length > 2) break;

      pointsPath.push(pointer);
      cloud.splice(cloud.indexOf(pointer), 1);

      if (linkToPointer) {
        path.push(...this.interpolateLink(linkToPointer, divisions));
      } else {
        path.push({ x: pointer.x, y: pointer.y });
      }

      let next = null;
      let nextLink = null;
      let nextAngle = Infinity;

      for (const candidateLink of pointer.links) {
        const candidate = candidateLink.opposite(pointer);

        if (candidate === pointsPath[pointsPath.length - 2]) continue;

        if (!cloud.includes(candidate) && candidate !== start) continue;

        // prettier-ignore
        const candidateAngle =
          (
            Math.atan2(candidate.y - pointer.y, candidate.x - pointer.x) / Math.PI * 180
            - (entryAngle - 180)
            + 720
          ) % 360;

        if (candidateAngle < nextAngle) {
          nextAngle = candidateAngle;
          nextLink = candidateLink;
          next = candidate;
        }
      }

      if (!next) return;

      pointer = next;
      entryAngle = nextAngle;
      linkToPointer = nextLink;
    }

    const loopLink = pointsPath[0].getLinkWith(
      pointsPath[pointsPath.length - 1]
    );

    if (!loopLink) return;

    path.push(...this.interpolateLink(loopLink, divisions));

    // Удаляем дубли

    for (let i = 1; i < path.length; i += 1) {
      if (path[i].x === path[i - 1].x && path[i].y === path[i - 1].y) {
        path.splice(i, 1);
      }
    }

    return path;
  }
}
