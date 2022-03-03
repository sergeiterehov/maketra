import { makeObservable, observable } from "mobx";
import { MkNode } from "./MkNode";

export class Section {
  @observable public id: string = "";
  @observable public name: string = "";
  @observable public parentSection?: Section = undefined;
  @observable public nodes: MkNode[] = [];

  constructor() {
    makeObservable(this);
  }
}
