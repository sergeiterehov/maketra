import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { ColorFill, LinearGradientFill } from "./models/Fill";
import { FPoint } from "./models/FPoint";
import { BlendMode } from "./models/MkNode";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { Space } from "./models/Space";
import { FontWeight, Text } from "./models/Text";

const space = Object.assign(new Space(), {
  projects: [
    Object.assign(new Project(), {
      id: "dj09hfwoe",
      name: "Test Project",
      description: "This is project for local testing when developing",
      sections: [
        Object.assign(new Section(), {
          id: "ld3h9",
          name: "Style guides",
          nodes: [
            Object.assign(new Area(), {
              name: "Main screen Area",
              x: 30,
              y: 30,
              width: 300,
              height: 400,
            }),
          ],
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

// cp[7].getLinkWith(cp[3])!.aControl.x = 20;
// cp[7].getLinkWith(cp[3])!.aControl.y = -40;

space.projects[0].sections[0].nodes[0].add(
  Object.assign(new Area(), {
    name: "Internal Area",
    x: 30,
    y: 30,
    width: 100,
    height: 240,
    fills: [new ColorFill("#FAA"), new LinearGradientFill()],
  }).add(
    Object.assign(new Area(), {
      name: "End Area",
      x: 30,
      y: 30,
      width: 40,
      height: 60,
      fills: [new ColorFill("#AFA")],
      clipContent: false,
      opacity: 0.3,
    }).add(
      Object.assign(
        new Figure(),
        {
          name: "Star",
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
          fills: [new ColorFill("#E7F")],
          strokeWidth: 0,
        },
        { width: 50, height: 50 }
      )
    ),
    Object.assign(new Text(), {
      name: "Label 1",
      x: 20,
      y: 150,
      fontSize: 24,
      fontWeight: FontWeight.Regular,
      fontFamily: "sans-serif",
      text: "Hello, world!\nHow are you?",
      fills: [new LinearGradientFill({ x: 0, y: 48 }, { x: 0, y: 0 })],
      blendMode: BlendMode.ColorBurn,
    })
  ),
  Object.assign(new Figure(), {
    name: "Curved Circle",
    x: 140,
    y: 240,
    cornerRadius: 40,
    points: new FPoint(0, 0)
      .next(new FPoint(110, 0), { x: 30, y: -30 }, { x: -30, y: -30 })
      .next(new FPoint(110, 110), { x: 30, y: 30 }, { x: 30, y: -30 })
      .next(new FPoint(0, 110), { x: -30, y: 30 }, { x: 30, y: 30 })
      .loop({ x: -30, y: -30 }, { x: -30, y: 30 }).allPoints,
    fills: [new ColorFill("#AAF")],
    strokeWidth: 4,
  }),
  Object.assign(new Figure(), {
    name: "Complex Path",
    x: 10,
    y: 10,
    cornerRadius: 8,
    points: cp,
    fills: [new ColorFill("#F70")],
    strokeWidth: 2,
  })
);

export default space;
