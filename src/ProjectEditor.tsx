import { observer } from "mobx-react-lite";
import { useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { PropsContainer } from "./PropsContainer";
import { MkNode } from "./models/MkNode";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { NodeProps } from "./NodeProps";
import { useElementSize } from "./utils/useElementSize";
import Viewer from "./Viewer";
import { editorState } from "./editorState";

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
}>(({ nodes }) => {
  const { selected } = editorState;

  return (
    <ul>
      {nodes.map((n) => {
        return (
          <li key={n.id}>
            <NodeListItem
              className={selected === n ? "active" : undefined}
              onClick={() => editorState.select(n)}
            >
              {n.name}
            </NodeListItem>
            {n.children.length ? <NodesViewLevel nodes={n.children} /> : null}
          </li>
        );
      })}
    </ul>
  );
});

const NodesView = observer<{
  section: Section;
}>(({ section }) => {
  return <NodesViewLevel nodes={section.nodes} />;
});

export const ProjectEditor = observer<{ project: Project }>(({ project }) => {
  const [searchParams] = useSearchParams();

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerSize = useElementSize(viewerContainerRef);

  const section = project.sections.find((s) => s.id === searchParams.get("s"));

  const selectNodeHandler = useCallback(
    (node: MkNode) => editorState.select(node),
    []
  );

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
            width: 240,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <div style={{ borderBottom: "solid 1px #0002" }}>
            <SectionsView sections={project.sections} activeId={section?.id} />
          </div>
          <div>{section ? <NodesView section={section} /> : null}</div>
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
            />
          ) : null}
        </div>
        <PropsContainer
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: 240,
            height: "100%",
            flexShrink: 0,
          }}
        >
          {editorState.selected ? (
            <NodeProps node={editorState.selected} />
          ) : null}
        </PropsContainer>
      </div>
    </div>
  );
});
