import { Area, Figure, Project, Section, Space } from "./models";

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
    height: 100,
    backgroundColor: "#FAA",
  }).add(
    Object.assign(new Area(), {
      name: "End Area",
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      backgroundColor: "#AFA",
    }).add(
      Object.assign(new Figure(), {
        name: "Star",
        x: 5,
        y: 5,
        path: "M15.422,18.129l-5.264-2.768l-5.265,2.768l1.006-5.863L1.64,8.114l5.887-0.855l2.632-5.334l2.633,5.334l5.885,0.855l-4.258,4.152L15.422,18.129z",
        backgroundColor: "#AAF",
      })
    )
  )
);

export default space;
