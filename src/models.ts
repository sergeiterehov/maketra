import { Path } from "konva/lib/shapes/Path";
import { Transform } from "konva/lib/Util";
import { action, computed, makeObservable, observable } from "mobx";
import { measureTextWidth } from "./utils/measureTextWidth";
import { randomString } from "./utils/randomString";

export class Space {
  @observable public projects: Project[] = [];

  constructor() {
    makeObservable(this);
  }
}

export class Project {
  @observable public id: string = "";
  @observable public name: string = "";
  @observable public description: string = "";
  @observable public sections: Section[] = [];

  constructor() {
    makeObservable(this);
  }
}

export class Section {
  @observable public id: string = "";
  @observable public name: string = "";
  @observable public parentSection?: Section = undefined;
  @observable public nodes: MkNode[] = [];

  constructor() {
    makeObservable(this);
  }
}

// NODES

export class MkNode {
  public static reservedColors = new Map<string, MkNode>();

  public static generateColorKey(target: MkNode): string {
    for (let limit = 10000; limit > 0; limit -= 1) {
      const color = `rgb(${Math.round(Math.random() * 255)},${Math.round(
        Math.random() * 255
      )},${Math.round(Math.random() * 255)})`;

      if (MkNode.reservedColors.has(color)) continue;

      MkNode.reservedColors.set(color, target);

      return color;
    }

    throw new Error("Color key reserving took too long");
  }

  public static getNodeByHitCtx(
    hitCtx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    const pixel = hitCtx.getImageData(x, y, 1, 1).data;

    return MkNode.reservedColors.get(
      `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
    );
  }

  public hitColorKey: string = MkNode.generateColorKey(this);

  @observable public id: string = randomString();
  @observable public name: string = "Node";
  @observable public children: MkNode[] = [];
  @observable public parentNode?: MkNode = undefined;
  @observable public parentSection?: Section = undefined;

  @observable public x: number = 0;
  @observable public y: number = 0;
  @observable public scaleX: number = 1;
  @observable public scaleY: number = 1;
  @observable public rotate: number = 0;

  @computed protected get transform(): Transform {
    return new Transform()
      .translate(this.x, this.y)
      .scale(this.scaleX, this.scaleY)
      .rotate(this.rotate);
  }

  @computed protected get absoluteTransform(): Transform {
    let at = new Transform();

    if (this.parentNode) {
      this.parentNode.absoluteTransform.copyInto(at);
    }

    at.multiply(this.transform);

    return at;
  }

  constructor() {
    makeObservable(this);
  }

  public destroy() {
    MkNode.reservedColors.delete(this.hitColorKey);
    this.hitColorKey = "transparent";
  }

  @action public add(...children: MkNode[]) {
    for (const child of children) {
      child.moveTo(this);
    }

    return this;
  }

  @action moveTo(parentNode: MkNode) {
    this.parentNode = parentNode;
    this.moveToSection(parentNode.parentSection);
    parentNode.children.push(this);

    return this;
  }

  @action moveToSection(parentSection?: Section) {
    this.parentSection = parentSection;

    for (const child of this.children) {
      child.parentSection = this.parentSection;
    }

    return this;
  }

  public draw(
    ctxView: CanvasRenderingContext2D,
    ctxHit: CanvasRenderingContext2D,
    baseTransform: Transform
  ) {
    const m = baseTransform.copy().multiply(this.absoluteTransform).getMatrix();

    ctxView.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    ctxHit.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

    ctxHit.fillStyle = this.hitColorKey;
    ctxHit.strokeStyle = this.hitColorKey;

    this.drawView(ctxView);
    this.drawHit(ctxHit);

    for (const child of this.children) {
      child.draw(ctxView, ctxHit, baseTransform);
    }
  }

  protected drawView(ctx: CanvasRenderingContext2D) {
    throw new Error("Node can not be drawn");
  }

  protected drawHit(ctx: CanvasRenderingContext2D) {
    // not implemented
  }
}

export class Group extends MkNode {
  public name: string = "Group";

  constructor() {
    super();

    makeObservable(this);
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    // not implemented
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    // not implemented
  }
}

export class Area extends Group {
  public name: string = "Area";

  @observable public width: number = 0;
  @observable public height: number = 0;

  @observable public backgroundColor: string = "#FFFFFF";

  constructor() {
    super();

    makeObservable(this);
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    const { width, height, backgroundColor } = this;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    ctx.textBaseline = "bottom";
    ctx.font = "14px monospace";
    ctx.fillText(this.name, 0, -8);
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.fillRect(0, 0, width, height);
  }
}

export class Primitive extends MkNode {
  public name: string = "Primitive";

  constructor() {
    super();

    makeObservable(this);
  }
}

export class Figure extends Primitive {
  public name: string = "Figure";

  @observable public path: string = "";
  @observable public backgroundColor: string = "#AAAAAA";
  @observable public strokeColor: string = "#000000";

  @computed protected get pathData(): any[] {
    return Path.parsePathData(this.path);
  }

  constructor() {
    super();

    makeObservable(this);
  }

  private renderPathData(ctx: CanvasRenderingContext2D): void {
    const commands = this.pathData;
    let isClosed = false;

    ctx.beginPath();

    for (let n = 0; n < commands.length; n++) {
      const command = commands[n].command;
      const p = commands[n].points;

      switch (command) {
        case "L":
          ctx.lineTo(p[0], p[1]);

          break;
        case "M":
          ctx.moveTo(p[0], p[1]);

          break;
        case "C":
          ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);

          break;
        case "Q":
          ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);

          break;
        case "A":
          const cx = p[0];
          const cy = p[1];
          const rx = p[2];
          const ry = p[3];
          const theta = p[4];
          const dTheta = p[5];
          const psi = p[6];
          const fs = p[7];

          const r = rx > ry ? rx : ry;
          const scaleX = rx > ry ? 1 : rx / ry;
          const scaleY = rx > ry ? ry / rx : 1;

          ctx.translate(cx, cy);
          ctx.rotate(psi);
          ctx.scale(scaleX, scaleY);
          ctx.arc(0, 0, r, theta, theta + dTheta, Boolean(1 - fs));
          ctx.scale(1 / scaleX, 1 / scaleY);
          ctx.rotate(-psi);
          ctx.translate(-cx, -cy);

          break;
        case "z":
          isClosed = true;
          ctx.closePath();

          break;
      }
    }

    if (isClosed) {
      ctx.fill();
    }

    ctx.stroke();
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.backgroundColor;
    ctx.strokeStyle = this.strokeColor;

    this.renderPathData(ctx);
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    this.renderPathData(ctx);
  }
}

export class Text extends Primitive {
  public name: string = "Text";

  @observable public text: string = "Sample";
  @observable public fontFamily: string = "monospace";
  @observable public fontSize: number = 14;
  @observable public fontSizeUnit: string = "px";
  @observable public fontWeight: string = "normal";

  @observable public textColor: string = "#000000";

  @computed protected get font(): string {
    const { fontFamily, fontSizeUnit, fontSize, fontWeight } = this;

    return `${fontWeight} ${fontSize}${fontSizeUnit} ${fontFamily}`;
  }

  @computed protected get computedTextWidth(): number {
    const { text, font } = this;

    return measureTextWidth(text, font);
  }

  @computed protected get computedTextHeight(): number {
    const { textLines, fontSize } = this;

    return textLines.length * fontSize;
  }

  @computed public get textLines() {
    const { text } = this;

    return text.split("\n");
  }

  constructor() {
    super();

    makeObservable(this);
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    const { text, x, y, textColor, font } = this;

    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    const { x, y, computedTextHeight, computedTextWidth } = this;

    ctx.fillRect(x, y, computedTextWidth, computedTextHeight);
  }
}
