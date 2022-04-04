import { Area } from "../models/Area";
import {
  FigureEditor,
  FigureEditorControl,
  FigureEditorPoint,
} from "../models/controllers/FigureEditor";
import { Figure } from "../models/Figure";
import { BlendMode, ColorFill, Fill, LinearGradientFill } from "../models/Fill";
import { BlurFilter, DropShadowFilter, Filter } from "../models/Filter";
import { FLink } from "../models/FPoint";
import { MkNode } from "../models/MkNode";
import { Primitive } from "../models/Primitive";
import { StrokeStyle } from "../models/Stroke";
import { Text, TextAlign } from "../models/Text";
import { FigureHelper } from "../utils/FigureHelper";
import { Transform, TransformComponents } from "../utils/Transform";

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private hit?: CanvasRenderingContext2D;
  private viewTransformComponents: TransformComponents = null as any;

  disableFilters: boolean = true;
  disableBlendMode: boolean = false;
  disableOpacity: boolean = false;

  /** Позволяет указать точное количество сегментов каждой кривой. */
  curveDivisions?: number = 10;

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
    const { transform, ctx, hit, disableOpacity } = this;

    if (!visible) return;

    const viewTransform = transform.copy().multiply(absoluteTransform);

    this.viewTransformComponents = viewTransform.decompose();

    const m = viewTransform.getMatrix();

    ctx.save();
    hit?.save();

    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    hit?.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

    this.applyBlendMode(blendMode);

    if (!disableOpacity) {
      ctx.globalAlpha *= opacity;
    }

    if (hit) {
      hit.fillStyle = hitColorKey;
      hit.strokeStyle = hitColorKey;
    }

    for (const filter of filters) {
      const { disabled } = filter;

      if (disabled) continue;

      this.applyFilter(filter);
    }

    if (!interactive) this.hit = undefined;

    if (node instanceof Area) this.renderArea(node);
    else if (node instanceof Text) this.renderText(node);
    else if (node instanceof Figure) this.renderFigure(node);
    else if (node instanceof FigureEditor) this.renderFigureEditor(node);
    else if (node instanceof FigureEditorPoint)
      this.renderFigureEditorPoint(node);
    else if (node instanceof FigureEditorControl)
      this.renderFigureEditorControl(node);

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

    ctx.filter = "none";
    ctx.fillStyle = "#EEE";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    hit?.clearRect(0, 0, hit.canvas.width, hit.canvas.height);
  }

  protected addFilter(filter: string) {
    const { ctx } = this;

    ctx.filter = `${ctx.filter.replace("none", "")} ${filter}`;
  }

  protected applyBlurFilter(filter: BlurFilter) {
    this.addFilter(`blur(${filter.radius}px)`);
  }

  protected applyDropShadowFilter(filter: DropShadowFilter) {
    const { x, y, radius, color } = filter;
    this.addFilter(`drop-shadow(${x}px ${y}px ${radius}px ${color})`);
  }

  protected applyFilter(filter: Filter) {
    if (this.disableFilters) return;

    if (filter instanceof BlurFilter) this.applyBlurFilter(filter);
    else if (filter instanceof DropShadowFilter)
      this.applyDropShadowFilter(filter);
  }

  protected renderArea(area: Area) {
    const { ctx, hit } = this;
    const { width, height, parentNode, clipContent, name, cornerRadius } = area;

    const path = new Path2D();
    const radius = Math.min(cornerRadius, width / 2, height / 2);

    path.moveTo(0 + radius, 0);
    path.arcTo(width, 0, width, 0 + radius, radius);
    path.arcTo(width, height, width - radius, height, radius);
    path.arcTo(0, height, 0, 0 + radius, radius);
    path.arcTo(0, 0, 0 + radius, 0, radius);
    path.closePath();

    this.applyFills(area, () => ctx.fill(path));
    this.applyStrokes(area, () => ctx.stroke(path));

    if (parentNode) {
      hit?.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = "#000";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.font = "14px sans-serif";
      ctx.fillText(name, 0, -8);

      hit?.fillRect(0, -8 - 14, ctx.measureText(name).width, 14);
    }

    if (clipContent) {
      ctx.clip(path);

      hit?.clip(path);
    }
  }

  protected renderText(text: Text) {
    const { ctx, hit } = this;
    const {
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

      this.applyFills(text, () =>
        ctx.fillText(line, alignOffset, i * fontSize)
      );
      this.applyStrokes(text, () =>
        ctx.strokeText(line, alignOffset, i * fontSize)
      );
    }

    hit?.fillRect(0, 0, computedTextWidth, computedTextHeight);
  }

  protected renderFigure(figure: Figure): void {
    const { ctx, hit, curveDivisions } = this;
    const { size, points } = figure;

    // Находим все замкнутые области

    // TODO: путь должен содержать только вершины (посчитать кривые).
    // TODO: кривые должны быть посчитаны еще до рисования линий или заливок.

    const fillPath = FigureHelper.outline(points, curveDivisions);

    if (fillPath) {
      const path = new Path2D();

      path.moveTo(fillPath[0].x, fillPath[0].y);

      for (let i = 1; i < fillPath.length; i += 1) {
        path.lineTo(fillPath[i].x, fillPath[i].y);
      }

      path.closePath();

      let filled = false;

      this.applyFills(figure, () => {
        ctx.fill(path);
        filled = true;
      });

      if (hit && filled) {
        hit.fill(path);
      }
    }

    // рисуем все линии

    const links: FLink[] = [];

    for (const point of points) {
      for (const link of point.links) {
        if (!links.includes(link)) {
          links.push(link);
        }
      }
    }

    for (const link of links) {
      const linkPath = FigureHelper.interpolateLink(link, curveDivisions);

      const path = new Path2D();

      path.moveTo(linkPath[0].x, linkPath[0].y);

      for (const point of linkPath) {
        path.lineTo(point.x, point.y);
      }

      this.applyStrokes(figure, () => ctx.stroke(path));

      if (hit) {
        hit.lineWidth = 8;

        hit.stroke(path);
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

  protected renderFigureEditor(editor: FigureEditor) {
    const { target } = editor;

    if (!target) return;

    const {
      ctx,
      viewTransformComponents: { scaleX: scale },
    } = this;

    const links: FLink[] = [];

    for (const point of target.points) {
      for (const link of point.links) {
        if (!links.includes(link)) {
          links.push(link);
        }
      }
    }

    ctx.beginPath();

    for (const link of links) {
      ctx.moveTo(link.a.x, link.a.y);
      ctx.lineTo(link.b.x, link.b.y);
    }

    ctx.strokeStyle = "#0FF";
    ctx.lineWidth = 1 / scale;
    ctx.stroke();

    ctx.beginPath();

    for (const link of links) {
      ctx.moveTo(link.a.x, link.a.y);
      ctx.lineTo(link.a.x + link.aControl.x, link.a.y + link.aControl.y);

      ctx.moveTo(link.b.x, link.b.y);
      ctx.lineTo(link.b.x + link.bControl.x, link.b.y + link.bControl.y);
    }

    ctx.strokeStyle = "#F0F";
    ctx.lineWidth = 1 / scale;
    ctx.stroke();
  }

  protected renderFigureEditorPoint(pointNode: FigureEditorPoint) {
    const {
      ctx,
      hit,
      viewTransformComponents: { scaleX: scale },
    } = this;

    const size = 12 / scale;

    ctx.beginPath();
    ctx.rect(0 - size / 2, 0 - size / 2, size, size);

    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#0AF";
    ctx.lineWidth = 1 / scale;
    ctx.fill();
    ctx.stroke();

    if (hit) {
      const hitSize = size * 1.5;

      hit.fillRect(0 - hitSize / 2, 0 - hitSize / 2, hitSize, hitSize);
    }
  }

  protected renderFigureEditorControl(controlNode: FigureEditorControl) {
    const {
      ctx,
      hit,
      viewTransformComponents: { scaleX: scale },
    } = this;

    const size = 12 / scale;

    ctx.beginPath();
    ctx.ellipse(0, 0, size / 2, size / 2, 0, 0, Math.PI * 2);

    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#F0F";
    ctx.lineWidth = 1 / scale;
    ctx.fill();
    ctx.stroke();

    if (hit) {
      const hitSize = size * 1.5;

      hit.fillRect(0 - hitSize / 2, 0 - hitSize / 2, hitSize, hitSize);
    }
  }

  protected applyBlendMode(mode: BlendMode) {
    const { ctx, disableBlendMode } = this;

    if (disableBlendMode) return;

    ctx.globalCompositeOperation = mode;
  }

  protected applyFill(fill: Fill, action: () => void) {
    const { ctx } = this;
    const { blendMode } = fill;

    const prevBlendMode = ctx.globalCompositeOperation as BlendMode;

    if (blendMode) this.applyBlendMode(blendMode);

    // TODO: image https://stackoverflow.com/questions/10791610/javascript-html5-using-image-to-fill-canvas
    // TODO: radial https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient

    if (fill instanceof ColorFill) {
      const { color } = fill;

      ctx.fillStyle = color.hex_string;
    } else if (fill instanceof LinearGradientFill) {
      const { a, b, stops } = fill;

      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);

      for (const stop of stops) {
        gradient.addColorStop(stop.offset, stop.color.hex_string);
      }

      ctx.fillStyle = gradient;
    }

    action();

    this.applyBlendMode(prevBlendMode);
  }

  protected applyFills(node: MkNode, action: () => void) {
    const { fills } = node;

    for (const fill of fills) {
      const { disabled } = fill;

      if (disabled) continue;

      this.applyFill(fill, action);
    }
  }

  protected applyStrokes(node: Primitive, action: () => void) {
    const { ctx } = this;

    for (const stroke of node.strokes) {
      const { width, color, style, dashArray, disabled } = stroke;

      if (!width || disabled) continue;

      ctx.lineWidth = width;
      ctx.strokeStyle = color.hex_string;

      switch (style) {
        case StrokeStyle.Dash: {
          if (dashArray.length > 1) {
            ctx.setLineDash([dashArray[0], dashArray[1]]);
          } else {
            ctx.setLineDash([dashArray[0]]);
          }
          break;
        }
        case StrokeStyle.Custom: {
          ctx.setLineDash(dashArray);
          break;
        }
        default:
          ctx.setLineDash([]);
      }

      action();
    }
  }
}
