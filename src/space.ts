import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { BlendMode, ColorFill, LinearGradientFill } from "./models/Fill";
import { BlurFilter, DropShadowFilter } from "./models/Filter";
import { FPoint } from "./models/FPoint";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { Space } from "./models/Space";
import { Stroke, StrokeStyle } from "./models/Stroke";
import { FontWeight, Text } from "./models/Text";
import { Color } from "./utils/Color";

const space = Object.assign(new Space(), {
  projects: [
    Object.assign(new Project(), {
      id: "dj09hfwoe",
      name: "Тестовый проект",
      description:
        "Это локальный проект для тестирования при разработки клиентской части приложения",
      sections: [
        Object.assign(new Section(), {
          id: "ld3h9",
          name: "Проба пера",
        }),
      ],
    }),
  ],
});

const cp = [
  [2, 2],
  [5, 2],
  [3, 4],
  [5, 6],
  [7, 6],
  [7, 8],
  [3, 8],
  [1, 6],
].map(([x, y]) => new FPoint(x * 30, y * 30));

cp[0].connect(cp[1]);
cp[0].connect(cp[2]);
cp[2].connect(cp[7]);
cp[2].connect(cp[3]);
cp[3].connect(cp[7]);
cp[3].connect(cp[6]);
cp[3].connect(cp[4]);
cp[4].connect(cp[5]);
cp[6].connect(cp[7]);

new Area()
  .configure({
    name: "Главный экран",
    x: 30,
    y: 30,
    width: 300,
    height: 400,
  })
  .appendToSection(space.projects[0].sections[0]);

space.projects[0].sections[0].nodes[0].appendChild(
  new Area()
    .configure({
      name: "Вложенная Область",
      x: 30,
      y: 30,
      width: 100,
      height: 240,
      fills: [
        new ColorFill(new Color({ hex: "#FAA" })),
        new LinearGradientFill(),
      ],
      filters: [new DropShadowFilter()],
    })
    .appendChild(
      new Area()
        .configure({
          name: "Область в Области",
          x: 30,
          y: 30,
          width: 40,
          height: 60,
          fills: [new ColorFill(new Color({ hex: "#AFA" }))],
          clipContent: false,
          opacity: 0.3,
          filters: [new BlurFilter()],
        })
        .appendChild(
          new Figure()
            .configure({
              name: "Звезда",
              x: 5,
              y: 5,
              points: FPoint.start(15.422, 18.129)
                .line(-5.264, -2.768)
                .line(-5.265, 2.768)
                .line(1.006, -5.863)
                .lineTo(1.64, 8.114)
                .line(5.887, -0.855)
                .line(2.632, -5.334)
                .line(2.633, 5.334)
                .line(5.885, 0.855)
                .line(-4.258, 4.152)
                .loop().allPoints,
              fills: [new ColorFill(new Color({ hex: "#E7F" }))],
              strokes: [new Stroke(StrokeStyle.Solid, 1)],
              filters: [new BlurFilter()],
            })
            .configure({ width: 50, height: 50 })
        ),
      new Text().configure({
        name: "Надпись 1",
        x: 20,
        y: 150,
        fontSize: 24,
        fontWeight: FontWeight.Regular,
        text: "Привет Мир!\nКак ваши дела?",
        fills: [
          new LinearGradientFill({ x: 0, y: 48 }, { x: 0, y: 0 }, [
            { offset: 0, color: new Color({ hex: "#F00" }) },
            { offset: 1, color: new Color({ hex: "#0F0" }) },
          ]),
        ],
        blendMode: BlendMode.ColorBurn,
      })
    ),
  new Figure().configure({
    name: "Имитация круга",
    x: 140,
    y: 240,
    cornerRadius: 40,
    points: new FPoint(0, 0)
      .next(new FPoint(110, 0), { x: 30, y: -30 }, { x: -30, y: -30 })
      .next(new FPoint(110, 110), { x: 30, y: 30 }, { x: 30, y: -30 })
      .next(new FPoint(0, 110), { x: -30, y: 30 }, { x: 30, y: 30 })
      .loop({ x: -30, y: -30 }, { x: -30, y: 30 }).allPoints,
    fills: [new ColorFill(new Color({ hex: "#AAF" }))],
    strokes: [new Stroke(StrokeStyle.Solid, 4)],
  }),
  new Figure().configure({
    name: "Странная фигура",
    x: 10,
    y: 10,
    cornerRadius: 8,
    points: cp,
    fills: [new ColorFill(new Color({ hex: "#F70" }))],
    strokes: [new Stroke(StrokeStyle.Solid, 2)],
  })
);

export default space;
