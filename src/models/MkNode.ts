import { action, computed, makeObservable, observable } from "mobx";
import { randomString } from "../utils/randomString";
import { Transform } from "../utils/Transform";
import { BlendMode, Fill } from "./Fill";
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

  @observable public visible: boolean = true;
  @observable public interactive: boolean = true;

  @observable public blendMode: BlendMode = BlendMode.Normal;
  @observable public opacity: number = 1;

  @observable public fills: Fill[] = [];

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

  @observable public verticalConstraint: Constraint = Constraint.Start;
  @observable public horizontalConstraint: Constraint = Constraint.Start;

  /**
   * Использовать в вычислениях.
   */
  @computed public get size(): Size {
    return { width: this.width || 0, height: this.height || 0 };
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

  @computed public get allNodes(): MkNode[] {
    const nodes: MkNode[] = [];
    const lookup: MkNode[] = [this];

    while (lookup.length) {
      const node = lookup.pop()!;

      if (nodes.includes(node)) continue;

      nodes.push(node);
      lookup.push(...node.children);
    }

    return nodes;
  }

  constructor() {
    makeObservable(this);
  }

  @action public remove() {
    if (!this.parentNode) return;

    const index = this.parentNode.children.indexOf(this);

    this.parentNode.children.splice(index, 1);
    this.parentNode = undefined;
  }

  @action public destroy() {
    if (this.parentNode) {
      const index = this.parentNode.children.indexOf(this);

      this.parentNode.children.splice(index, 1);
      this.parentNode = undefined;
    }

    // Нужно пройти по копии массива, так как он изменяется.
    for (const child of [...this.children]) child.destroy();

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

    if (!parentNode.children.includes(this)) {
      parentNode.children.push(this);
    }

    return this;
  }

  @action moveToSection(parentSection?: Section) {
    this.parentSection = parentSection;

    for (const child of this.children) {
      child.parentSection = this.parentSection;
    }

    return this;
  }

  public findOneByName<T extends MkNode>(name: string): T | undefined {
    const pool: MkNode[] = [...this.children];

    while (pool.length) {
      const node = pool.pop()!;

      if (node.name === name) return node as T;

      pool.push(...node.children);
    }
  }

  public draw(
    ctxView: CanvasRenderingContext2D,
    ctxHit: CanvasRenderingContext2D | undefined,
    baseTransform: Transform
  ) {
    const { absoluteTransform, hitColorKey, children, visible, interactive } =
      this;

    const m = baseTransform.copy().multiply(absoluteTransform).getMatrix();

    ctxView.save();
    ctxView.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

    // TODO: для корректного применения операции предыдущий слой должен быть нарисован через ctx.drawImage(ctx.canvas)
    ctxView.globalCompositeOperation = this.blendMode as any;
    ctxView.globalAlpha *= this.opacity;

    if (ctxHit) {
      ctxHit?.save();
      ctxHit.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

      ctxHit.fillStyle = hitColorKey;
      ctxHit.strokeStyle = hitColorKey;
    }

    if (visible) {
      this.drawView(ctxView);

      if (interactive && ctxHit) {
        this.drawHit(ctxHit);
      }

      for (const child of children) {
        // Если элемент не интерактивный, то не передаем контекст для рисования маски.
        child.draw(ctxView, interactive ? ctxHit : undefined, baseTransform);
      }
    }

    ctxView.restore();

    if (ctxHit) {
      ctxHit.restore();
    }
  }

  protected drawView(ctx: CanvasRenderingContext2D) {
    throw new Error("Node can not be drawn");
  }

  protected drawHit(ctx: CanvasRenderingContext2D) {
    // not implemented
  }
}
