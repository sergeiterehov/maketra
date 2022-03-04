import { observable } from "mobx";
import { FPoint } from "./models/Figure";
import { Group } from "./models/Group";

const pathEditorGroup = new Group();

export const pathEditor = observable({
  group: pathEditorGroup,
  points: [] as FPoint[],
});
