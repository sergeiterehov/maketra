import { makeObservable, observable } from "mobx";
import { Project } from "./Project";

export class Space {
  @observable public projects: Project[] = [];

  constructor() {
    makeObservable(this);
  }
}
