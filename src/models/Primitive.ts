import { makeObservable, observable } from "mobx";
import { MkNode } from "./MkNode";
import { Stroke } from "./Stroke";

export class Primitive extends MkNode {
  public name: string = "Primitive";

  @observable public cornerRadius: number = 0;
  @observable public strokes: Stroke[] = [];

  constructor() {
    super();

    makeObservable(this);
  }
}
