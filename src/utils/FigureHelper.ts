import { FLink, FPoint } from "../models/FPoint";
import { Vector2d } from "./Transform";

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

    const v0: Vector2d = a;
    const v1: Vector2d = { x: a.x + aControl.x, y: a.y + aControl.y };
    const v2: Vector2d = { x: b.x + bControl.x, y: b.y + bControl.y };
    const v3: Vector2d = b;

    if (!divisions) {
      divisions = FigureHelper.lengths(
        ...FigureHelper.interpolateCurve(v0, v1, v2, v3, 5)
      );
    }

    return FigureHelper.interpolateCurve(v0, v1, v2, v3, divisions);
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
        path.push(...FigureHelper.interpolateLink(linkToPointer, divisions));
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

    if (loopLink) {
      path.push(...FigureHelper.interpolateLink(loopLink, divisions));
    }

    return path;
  }
}
