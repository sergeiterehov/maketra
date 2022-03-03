import { Transform } from "konva/lib/Util";
import { action, computed, makeObservable, observable } from "mobx";
import { randomString } from "../utils/randomString";
import { Section } from "./Section";

export enum Constraint {
  Start = 1,
  Center,
  End,

  Scale,

  Left = Start,
  Right = End,
  Top = Start,
  Bottom = End,
}

export interface Size {
  width: number;
  height: number;
}

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
  @observable public width?: number = undefined;
  @observable public height?: number = undefined;
  @observable public rotate: number = 0;
  /**
   * @deprecated
   */
  @observable public scaleX: number = 1;
  /**
   * @deprecated
   */
  @observable public scaleY: number = 1;

  // TODO: alignment
  @observable public verticalConstraint: Constraint = Constraint.Start;
  @observable public horizontalConstraint: Constraint = Constraint.Start;

  /**
   * Использовать в вычислениях.
   */
  @computed public get size(): Size {
    return { width: 0, height: 0 };
  }

  @computed protected get transform(): Transform {
    return new Transform()
      .translate(this.x, this.y)
      .scale(this.scaleX, this.scaleY)
      .rotate(this.rotate);
  }

  @computed public get absoluteTransform(): Transform {
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

  @action public destroy() {
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

  public findOneByName(name: string): MkNode | undefined {
    const pool: MkNode[] = [...this.children];

    while (pool.length) {
      const node = pool.pop()!;

      if (node.name === name) return node;

      pool.push(...node.children);
    }
  }

  public draw(
    ctxView: CanvasRenderingContext2D,
    ctxHit: CanvasRenderingContext2D,
    baseTransform: Transform
  ) {
    ctxView.save();
    ctxHit.save();

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

    ctxView.restore();
    ctxHit.restore();
  }

  protected drawView(ctx: CanvasRenderingContext2D) {
    throw new Error("Node can not be drawn");
  }

  protected drawHit(ctx: CanvasRenderingContext2D) {
    // not implemented
  }
}
