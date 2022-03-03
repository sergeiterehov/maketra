import { makeObservable } from "mobx";
import { MkNode } from "./MkNode";

export class Primitive extends MkNode {
  public name: string = "Primitive";

  constructor() {
    super();

    makeObservable(this);
  }
}
