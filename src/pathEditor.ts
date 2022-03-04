import { observable } from "mobx";
import { FPoint } from "./models/Figure";

export const pathEditor = observable({
  points: [] as FPoint[],
});
