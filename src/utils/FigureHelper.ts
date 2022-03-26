import { FPoint } from "../models/FPoint";
import { Vector2d } from "./Transform";

export class FigureHelper {
  static outline(points: FPoint[]): Vector2d[] | void {
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

    if (!pointer) return;

    const path: FPoint[] = [];

    while (pointer) {
      if (pointer === start && path.length > 2) break;

      path.push(pointer);
      cloud.splice(cloud.indexOf(pointer), 1);

      let next = null;
      let nextAngle = Infinity;

      for (const link of pointer.links) {
        const candidate = link.opposite(pointer);

        if (candidate === path[path.length - 2]) continue;

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
          next = candidate;
        }
      }

      if (!next) return;

      pointer = next;
      entryAngle = nextAngle;
    }

    return path;
  }
}
