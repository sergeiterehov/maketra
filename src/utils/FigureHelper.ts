import { FLink, FPoint } from "../models/FPoint";

export class FigureHelper {
  static outline(points: FPoint[]): FPoint[] | void {
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

    console.log(
      "TAILS CLEAN",
      cloud.map((p) => [p.key, p.linkedPoints.map((pp) => pp.key), p.x, p.y])
    );

    // Начинаем с самой крайней правой точки.
    // Находим связь с минимальным углом и идем по ней.

    const stack: Array<{ pointer: FPoint; links: FLink[] }> = [];

    function push(pointer: FPoint) {
      const links = [...pointer.links];

      links.sort((a, b) => b.getAngleTo(pointer) - a.getAngleTo(pointer));

      stack.push({ pointer, links });
    }

    function extractPathFromStack(): FPoint[] {
      const path: FPoint[] = [];

      for (const item of stack) {
        path.push(item.pointer);
      }

      return path;
    }

    while (cloud.length) {
      stack.splice(0);

      push(cloud.pop()!);

      let path: FPoint[] = [];

      STACK_WHILE: while (stack.length && stack.length < 100) {
        const { pointer, links } = stack[stack.length - 1];

        const nextLink = links.pop();

        if (!nextLink) {
          stack.pop();
          continue;
        }

        const next = nextLink.opposite(pointer);

        if (stack[0].pointer === next && stack.length > 2) {
          // LOOP
          path = extractPathFromStack();

          break STACK_WHILE;
        }

        if (!cloud.includes(next)) continue;

        for (const item of stack) {
          if (item.pointer === next) {
            continue STACK_WHILE;
          }
        }

        push(next);
      }

      for (const point of path) {
        cloud.splice(cloud.indexOf(point), 1);
      }

      if (path.length) {
        console.log(
          "PATH",
          path.map((p) => p.key)
        );
      }
    }

    return;
  }
}
