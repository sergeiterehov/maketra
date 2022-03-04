import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { FPoint } from "./models/FPoint";
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

space.projects[0].sections[0].nodes[0].add(
  Object.assign(new Area(), {
    name: "Internal Area",
    x: 30,
    y: 30,
    width: 100,
    height: 240,
    backgroundColor: "#FAA",
  }).add(
    Object.assign(new Area(), {
      name: "End Area",
      x: 30,
      y: 30,
      width: 40,
      height: 60,
      backgroundColor: "#AFA",
    }).add(
      Object.assign(new Figure(), {
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
          .lineTo(15.422, 18.129)
          .loop().allPoints,
        backgroundColor: "#AAF",
        strokeWidth: 0,
      })
    ),
    Object.assign(new Text(), {
      name: "Label 1",
      x: 20,
      y: 150,
      fontSize: 24,
      fontWeight: FontWeight.Regular,
      fontFamily: "sans-serif",
      text: "Hello, world!\nHow are you?",
      textColor: "#272",
    })
  ),
  Object.assign(new Figure(), {
    name: "Figure",
    x: 5,
    y: 5,
    points: new FPoint(0, 0, 30, -30)
      .next(new FPoint(60, 0, 30, 30))
      .next(new FPoint(60, 60, -30, 30))
      .next(new FPoint(0, 60, -30, -30))
      .loop().allPoints,
    backgroundColor: "#AAF",
    strokeWidth: 2,
  })
);

export default space;
