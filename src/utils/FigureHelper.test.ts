import "@testing-library/react";
import { FPoint } from "../models/FPoint";
import { FigureHelper } from "./FigureHelper";

test("Квадрат", () => {
  expect(
    FigureHelper.outline(
      new FPoint(0, 0)
        .next(new FPoint(1, 0))
        .next(new FPoint(1, 1))
        .next(new FPoint(0, 1))
        .loop().allPoints
    )
  ).toHaveLength(4);
});

test("Звезда", () => {
  expect(
    FigureHelper.outline(
      FPoint.start(15.422, 18.129)
        .line(-5.264, -2.768)
        .line(-5.265, 2.768)
        .line(1.006, -5.863)
        .lineTo(1.64, 8.114)
        .line(5.887, -0.855)
        .line(2.632, -5.334)
        .line(2.633, 5.334)
        .line(5.885, 0.855)
        .line(-4.258, 4.152)
        .loop().allPoints
    )
  ).toHaveLength(10);
});

test("Странная фигура", () => {
  const cp = [
    [2, 2],
    [5, 2],
    [3, 4],
    [5, 6],
    [7, 6],
    [7, 8],
    [3, 8],
    [1, 6],
  ].map(([x, y]) => new FPoint(x, y));

  cp[0].connect(cp[1]);
  cp[0].connect(cp[2]);
  cp[2].connect(cp[7]);
  cp[2].connect(cp[3]);
  cp[3].connect(cp[7]);
  cp[3].connect(cp[6]);
  cp[3].connect(cp[4]);
  cp[4].connect(cp[5]);
  cp[6].connect(cp[7]);

  expect(FigureHelper.outline(cp)).toHaveLength(4);
});

test("Разделение кривой", () => {
  expect(
    FigureHelper.bezSplit2([200, 300, 100, 100, 500, 100, 400, 300])
  ).toEqual([
    [200, 300, 150, 200, 225, 150, 300, 150],
    [300, 150, 375, 150, 450, 200, 400, 300],
  ]);
});

test("Поиск пересечения", () => {
  const p = FigureHelper.bezInt(
    [200, 300, 100, 100, 500, 100, 400, 300],
    [0, 0, 0, 0, 500, 500, 500, 500]
  );

  expect(p).toBeDefined();

  expect(Math.round(p!.x)).toEqual(196);
  expect(Math.round(p!.y)).toEqual(196);
});
