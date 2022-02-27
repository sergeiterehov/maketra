import { Area, Project, Section, Space } from "./models";

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
    })
  )
);

export default space;
