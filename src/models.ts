import { Transform } from "konva/lib/Util";
import { action, computed, makeObservable, observable } from "mobx";
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

    console.log(pixel, x, y)

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

export class Area extends MkNode {
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
    ctx.font = "14px monospace";
    ctx.fillText(this.name, 0, -8);
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.fillStyle = this.hitColorKey;
    ctx.fillRect(0, 0, width, height);
  }
}
