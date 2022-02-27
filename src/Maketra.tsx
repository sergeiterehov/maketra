import { observer } from "mobx-react-lite";
import { FC, useCallback, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router-dom";
import styled from "styled-components";
import { Area, MkNode, Project, Section } from "./models";
import space from "./space";
import { useElementSize } from "./utils/useElementSize";
import Viewer from "./Viewer";

const ProjectPreview: FC<{
  id: string;
  name: string;
  description: string;
}> = ({ id, name, description }) => {
  return (
    <Link to={`/${id}`}>
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
};

const ProjectsView = observer(() => {
  return (
    <div>
      This is Projects:
      {space.projects.map((project) => (
        <ProjectPreview
          key={project.id}
          id={project.id}
          name={project.name}
          description={project.description}
        />
      ))}
    </div>
  );
});

const SectionLink = styled(Link)`
  &.active {
    background-color: #0002;
  }
`;

const NodeListItem = styled.div`
  &.active {
    background-color: #0002;
  }
`;

const SectionsView = observer<{
  sections: Section[];
  activeId?: string;
}>(({ sections, activeId }) => {
  const [searchParams] = useSearchParams();

  return (
    <ul>
      {sections.map((s) => {
        const search = new URLSearchParams(searchParams);

        search.set("s", s.id);

        const isActive = search.get("s") === activeId;

        return (
          <li key={s.id}>
            <SectionLink
              replace
              className={isActive ? "active" : ""}
              to={{ search: search.toString() }}
            >
              {s.name}
            </SectionLink>
          </li>
        );
      })}
    </ul>
  );
});

const NodesViewLevel = observer<{
  nodes: MkNode[];
  selected?: MkNode;
  onSelect(node: MkNode): void;
}>(({ nodes, selected, onSelect }) => {
  return (
    <ul>
      {nodes.map((n) => {
        return (
          <li>
            <NodeListItem
              className={selected === n ? "active" : undefined}
              onClick={() => onSelect(n)}
            >
              {n.name}
            </NodeListItem>
            {n.children.length ? (
              <NodesViewLevel
                nodes={n.children}
                selected={selected}
                onSelect={onSelect}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
});

const NodesView = observer<{
  section: Section;
  selected?: MkNode;
  onSelect(node: MkNode): void;
}>(({ section, selected, onSelect }) => {
  return (
    <NodesViewLevel
      nodes={section.nodes}
      selected={selected}
      onSelect={onSelect}
    />
  );
});

const ProjectEditor = observer<{ project: Project }>(({ project }) => {
  const [searchParams] = useSearchParams();

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerSize = useElementSize(viewerContainerRef);

  const [selectedNode, setSelectedNode] = useState<MkNode>();

  const section = project.sections.find((s) => s.id === searchParams.get("s"));

  const selectNodeHandler = useCallback((node: MkNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flexShrink: 0, borderBottom: "solid 1px #0002" }}>
        <Link to="/">Назад</Link>
        <input
          value={project.name}
          onChange={(e) => (project.name = e.currentTarget.value)}
        />
      </div>
      <div style={{ display: "flex", height: "100%" }}>
        <div
          style={{
            width: 320,
            height: "100%",
            flexShrink: 0,
            borderRight: "solid 1px #0002",
          }}
        >
          <div style={{ borderBottom: "solid 1px #0002" }}>
            <SectionsView sections={project.sections} activeId={section?.id} />
          </div>
          <div>
            {section ? (
              <NodesView
                section={section}
                selected={selectedNode}
                onSelect={selectNodeHandler}
              />
            ) : null}
          </div>
        </div>
        <div
          ref={viewerContainerRef}
          style={{ width: "100%", overflow: "hidden" }}
        >
          {section && viewerContainerSize ? (
            <Viewer
              section={section}
              width={viewerContainerSize.width}
              height={viewerContainerSize.height}
              selected={selectedNode}
              onSelect={selectNodeHandler}
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: 320,
            height: "100%",
            flexShrink: 0,
            borderLeft: "solid 1px #0002",
          }}
        >
          {selectedNode ? (
            <>
              <div>
                Name:
                <input
                  value={selectedNode.name}
                  onChange={(e) => (selectedNode.name = e.currentTarget.value)}
                />
              </div>
              {(
                ["x", "y", "scaleX", "scaleY", "rotate"] as Array<keyof MkNode>
              ).map((key) => (
                <div>
                  {key}=
                  <input
                    key={key}
                    type="number"
                    step={0.1}
                    value={String(selectedNode[key])}
                    onChange={(e) =>
                      ((selectedNode[key] as any) =
                        Number(e.currentTarget.value) || 0)
                    }
                  />
                </div>
              ))}
              {selectedNode instanceof Area ? (
                <div>
                  Background color:
                  <input
                    value={selectedNode.backgroundColor}
                    onChange={(e) =>
                      (selectedNode.backgroundColor = e.currentTarget.value)
                    }
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
});

const ProjectEditorView = observer(() => {
  const { projectId } = useParams();

  return (
    <ProjectEditor project={space.projects.find((p) => p.id === projectId)!} />
  );
});

function Maketra() {
  return (
    <>
      <div>Hello, Maketra!</div>
      <Routes>
        <Route index element={<ProjectsView />} />
        <Route path="/:projectId" element={<ProjectEditorView />} />
      </Routes>
    </>
  );
}

export default Maketra;
