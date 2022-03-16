import { makeObservable } from "mobx";
import { MkNode } from "./MkNode";

export class Group extends MkNode {
  public name: string = "Group";

  constructor() {
    super();

    makeObservable(this);
  }
}
