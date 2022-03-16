import { Area } from "../models/Area";
import { Figure, StrokeStyle } from "../models/Figure";
import { FPoint } from "../models/FPoint";
import { MkNode } from "../models/MkNode";
import { Text, TextAlign } from "../models/Text";
import { Transform } from "../utils/Transform";

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private hit?: CanvasRenderingContext2D;
  
  transform: Transform;

  constructor(
    viewContext: CanvasRenderingContext2D,
    hitContext?: CanvasRenderingContext2D
  ) {
    this.ctx = viewContext;
    this.hit = hitContext;
    this.transform = new Transform();
  }

  renderNode(node: MkNode) {
    const {
      absoluteTransform,
      opacity,
      blendMode,
      filters,
      visible,
      hitColorKey,
      interactive,
    } = node;
    const { transform, ctx, hit } = this;

    if (!visible) return;

    const m = transform.copy().multiply(absoluteTransform).getMatrix();

    ctx.save();
    hit?.save();

    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    hit?.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

    ctx.globalCompositeOperation = blendMode as any;
    ctx.globalAlpha *= opacity;

    if (hit) {
      hit.fillStyle = hitColorKey;
      hit.strokeStyle = hitColorKey;
    }

    for (const filter of filters) {
      filter.apply(ctx);
    }

    if (!interactive) this.hit = undefined;

    if (node instanceof Area) this.renderArea(node);
    else if (node instanceof Text) this.renderText(node);
    else if (node instanceof Figure) this.renderFigure(node);

    for (const child of node.children) {
      this.renderNode(child);
    }

    this.hit = hit;

    ctx.restore();
    hit?.restore();
  }

  clear() {
    const { ctx, hit } = this;

    ctx.resetTransform();

    ctx.fillStyle = "#DDD";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    hit?.clearRect(0, 0, hit.canvas.width, hit.canvas.height);
  }

  protected renderArea(area: Area) {
    const { ctx, hit } = this;
    const { width, height, fills, parentNode, clipContent, name } = area;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    for (const fill of fills) {
      fill.apply(ctx);
      ctx.fill();
    }

    if (parentNode) {
      hit?.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.font = "14px monospace";
      ctx.fillText(name, 0, -8);

      hit?.fillRect(0, -8 - 14, ctx.measureText(name).width, 14);
    }

    if (clipContent) {
      const clip = new Path2D();

      clip.rect(0, 0, width, height);
      ctx.clip(clip);

      hit?.clip(clip);
    }
  }

  protected renderText(text: Text) {
    const { ctx, hit } = this;
    const {
      fills,
      font,
      textLines,
      fontSize,
      textAlign,
      computedTextWidth,
      computedTextHeight,
    } = text;

    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.textAlign = textAlign as any;

    let alignOffset = 0;

    switch (textAlign) {
      case TextAlign.Center:
        alignOffset = computedTextWidth / 2;
        break;
      case TextAlign.Right:
        alignOffset = computedTextWidth;
        break;
      default:
    }

    for (let i = 0; i < textLines.length; i += 1) {
      const line = textLines[i];

      for (const fill of fills) {
        fill.apply(ctx);
        ctx.fillText(line, alignOffset, i * fontSize);
      }
    }

    hit?.fillRect(0, 0, computedTextWidth, computedTextHeight);
  }

  protected renderFigure(figure: Figure): void {
    const { ctx, hit } = this;
    const {
      fills,
      strokeStyle,
      strokeWidth,
      strokeColor,
      strokeDash,
      strokeDashGap,
      size,
      points,
    } = figure;

    if (strokeWidth) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;

      if (strokeStyle === StrokeStyle.Dash) {
        ctx.setLineDash([strokeDash, strokeDashGap ?? strokeDash]);
      }
    }

    // Находим все замкнутые области

    // TODO:

    // рисуем все линии

    const pairs = new Map<FPoint, FPoint[]>();

    for (const point of points) {
      pairs.set(point, point.linkedPoints);
    }

    for (const point of points) {
      const linked = pairs.get(point)!;

      for (const pair of linked) {
        const pairLinked = pairs.get(pair)!;

        pairLinked.slice(pairLinked.indexOf(point, 1));

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(pair.x, pair.y);
        ctx.stroke();

        if (hit) {
          hit.lineWidth = 8;

          hit.beginPath();
          hit.moveTo(point.x, point.y);
          hit.lineTo(pair.x, pair.y);
          hit.stroke();
        }
      }
    }

    if (Figure.debug) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size.width, 0);
      ctx.lineTo(size.width, size.height);
      ctx.lineTo(0, size.height);
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#F005";
      ctx.stroke();
    }
  }
}
