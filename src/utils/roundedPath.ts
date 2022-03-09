import { FLink, FPoint } from "../models/FPoint";
import { Vector2d } from "./Transform";

function triangleInnerRadius(A: FPoint, B: FPoint, C: FPoint): number {
  const a = Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
  const b = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2));
  const c = Math.sqrt(Math.pow(C.x - B.x, 2) + Math.pow(C.y - B.y, 2));
  const p = (a + b + c) / 2;

  return Math.sqrt((p - a) * (p - b) * (p - c)) / p;
}

export function roundedPath(
  ctx: CanvasRenderingContext2D,
  cornerRadius: number,
  points: FPoint[]
) {
  if (!points.length) return;

  if (points.length === 2) {
    const a = points[0];
    const b = points[1];

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    return;
  }

  const isClosed = points[0] === points[points.length - 1];

  if (!cornerRadius) {
    const a = points[0];

    ctx.moveTo(a.x, a.y);

    for (let i = 1; i < points.length; i += 1) {
      const p = points[i];

      ctx.lineTo(p.x, p.y);
    }

    return;
  }

  function corner(p: FPoint, p_to: Vector2d) {
    let link: FLink | undefined;

    if (p_to instanceof FPoint) {
      for (const l of p.links) {
        if (l.a === p_to || l.b === p_to) {
          link = l;
          break;
        }
      }
    }

    if (
      link &&
      p_to instanceof FPoint &&
      (link.aControl.x || link.aControl.y || link.bControl.x || link.bControl.y)
    ) {
      // TODO: Не работает!
      const pControl = link.getControlFor(p);
      const p_toControl = link.getControlFor(p_to);

      ctx.bezierCurveTo(
        p.x + pControl.x,
        p.y + pControl.y,
        p_to.x + p_toControl.x,
        p_to.y + p_toControl.y,
        p_to.x,
        p_to.y
      );
    } else if (p.links.length === 2) {
      ctx.arcTo(p.x, p.y, p_to.x, p_to.y, cornerRadius);
    } else {
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p_to.x, p_to.y);
    }
  }

  // Расчет скругления первой точки
  const deltaY = points[1].y - points[0].y;
  const deltaX = points[1].x - points[0].x;
  const xPerY = deltaY / deltaX;
  const start: Vector2d = {
    x: points[0].x + deltaX / 2,
    y: points[0].y + (xPerY * deltaX) / 2,
  };

  ctx.moveTo(start.x, start.y);

  for (let i = 2; i < points.length; i += 1) {
    const p_1 = points[i - 1];
    const p = points[i];

    corner(p_1, p);
  }

  if (isClosed) {
    corner(points[points.length - 1], start);
  } else {
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  }
}
