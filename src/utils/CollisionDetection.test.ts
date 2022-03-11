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

test("Пересечения векторов", () => {
  expect(
    CollisionDetection.vector2(
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 }
    )
  ).toEqual({ x: 50, y: 50 });
  expect(
    CollisionDetection.vector2(
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 300, y: 0 },
      { x: 200, y: 100 }
    )
  ).toBeUndefined();
  expect(
    CollisionDetection.vector2(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 }
    )
  ).toBeUndefined();
});

test("Пересечения 2 прямоугольников", () => {
  const a = FPoint.start(0, 0)
    .line(100, 0)
    .line(0, 100)
    .line(-100, 0)
    .loop().allLinks;
  const b = FPoint.start(50, 50)
    .line(100, 0)
    .line(0, 100)
    .line(-100, 0)
    .loop().allLinks;

  const ab = [...a, ...b];

  expect(CollisionDetection.links(ab).flat()).toEqual([
    { x: 50, y: 100 },
    { x: 100, y: 50 },
  ]);
});
