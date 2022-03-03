import { makeObservable, observable } from "mobx";
import { Section } from "./Section";

export class Project {
  @observable public id: string = "";
  @observable public name: string = "";
  @observable public description: string = "";
  @observable public sections: Section[] = [];

  constructor() {
    makeObservable(this);
  }
}
