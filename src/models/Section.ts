import { computed, makeObservable, observable } from "mobx";
import { MkNode } from "./MkNode";

export class Section {
  @observable public id: string = "";
  @observable public name: string = "";
  @observable public parentSection?: Section = undefined;
  @observable public nodes: MkNode[] = [];

  constructor() {
    makeObservable(this);
  }

  @computed get allNodes(): MkNode[] {
    const acc: MkNode[] = [];

    for (const rootNode of this.nodes) {
      for (const node of rootNode.allNodes) {
        acc.push(node);
      }
    }

    return acc;
  }

  includes(searching: MkNode): boolean {
    for (const rootNode of this.nodes) {
      for (const node of rootNode.allNodes) {
        if (node === searching) return true;
      }
    }

    return false;
  }
}
