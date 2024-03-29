import { action, computed, makeObservable, observable } from "mobx";
import { randomString } from "../utils/randomString";
import { Transform } from "../utils/Transform";
import { BlendMode, Fill } from "./Fill";
import { Filter } from "./Filter";
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
  @observable public filters: Filter[] = [];

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

  @action public configure(props: Partial<typeof this>) {
    Object.assign(this, props);

    return this;
  }

  @action public remove() {
    if (this.parentNode) {
      const inParentIndex = this.parentNode.children.indexOf(this);

      if (inParentIndex !== -1) {
        this.parentNode.children.splice(inParentIndex, 1);
      }

      this.parentNode = undefined;
    }

    this.appendToSection();

    return this;
  }

  @action public destroy() {
    this.remove();

    // Нужно пройти по копии массива, так как он изменяется.
    for (const child of [...this.children]) child.destroy();

    MkNode.reservedColors.delete(this.hitColorKey);
    this.hitColorKey = "transparent";
  }

  @action public appendChild(...children: MkNode[]) {
    for (const child of children) {
      child.appendTo(this);
    }

    return this;
  }

  @action appendTo(parentNode: MkNode) {
    if (!parentNode.children.includes(this)) {
      this.remove();

      this.parentNode = parentNode;
      this.appendToSection(parentNode.parentSection);

      parentNode.children.push(this);
    }

    return this;
  }

  @action appendNear(neighborNode: MkNode, after = false) {
    if (neighborNode === this) return this;

    this.remove();

    const parentNode = neighborNode.parentNode;
    const parentSection = neighborNode.parentSection;

    if (parentNode) {
      this.parentNode = parentNode;
      this.appendToSection(parentSection);

      parentNode.children.splice(
        parentNode.children.indexOf(neighborNode) + (after ? 1 : 0),
        0,
        this
      );
    } else if (parentSection) {
      this.parentSection = parentSection;

      parentSection.nodes.splice(
        parentSection.nodes.indexOf(neighborNode) + (after ? 1 : 0),
        0,
        this
      );
    }

    return this;
  }

  @action appendToSection(parentSection?: Section) {
    if (this.parentSection) {
      const inSectionIndex = this.parentSection.nodes.indexOf(this);

      if (inSectionIndex !== -1) {
        this.parentSection.nodes.splice(inSectionIndex, 1);
      }
    }

    this.parentSection = parentSection;

    for (const child of this.children) {
      child.appendToSection(parentSection);
    }

    if (!this.parentNode && parentSection) {
      parentSection.nodes.push(this);
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
}
