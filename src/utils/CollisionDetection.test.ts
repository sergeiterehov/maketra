import "@testing-library/react";
import { FPoint } from "../models/FPoint";
import { CollisionDetection } from "./CollisionDetection";

const rectanglePath = FPoint.start(0, 0)
  .line(100, 0)
  .line(0, 100)
  .line(-100, 0)
  .loop().allPoints;

test("Точка внутри пути (прямоугольник)", () => {
  expect(
    CollisionDetection.isPointInPath({ x: 50, y: 50 }, rectanglePath)
  ).toBeTruthy();
  expect(
    CollisionDetection.isPointInPath({ x: 99, y: 1 }, rectanglePath)
  ).toBeTruthy();
  expect(
    CollisionDetection.isPointInPath({ x: 100, y: 10 }, rectanglePath)
  ).toBeTruthy();
});

test("Точка снаружи пути (прямоугольник)", () => {
  expect(
    CollisionDetection.isPointInPath({ x: -50, y: 10 }, rectanglePath)
  ).toBeFalsy();
  expect(
    CollisionDetection.isPointInPath({ x: 1, y: 1000 }, rectanglePath)
  ).toBeFalsy();
  expect(
    CollisionDetection.isPointInPath({ x: 40, y: -30 }, rectanglePath)
  ).toBeFalsy();
});
