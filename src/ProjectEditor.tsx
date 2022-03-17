import { observer, useObserver } from "mobx-react-lite";
import {
  FC,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  createSearchParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { PropsContainer } from "./PropsContainer";
import { MkNode } from "./models/MkNode";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { NodeProps } from "./NodeProps";
import { useElementSize } from "./utils/useElementSize";
import Viewer from "./Viewer";
import { editorState } from "./editorState";
import { NodeTreeRow } from "./components/NodeTreeRow";
import { SectionListRow } from "./components/SectionListRow";
import { runInAction } from "mobx";
import { ObjectsContainer } from "./ObjectsContainer";

const SectionsList: FC<{
  project: Project;
  activeId?: string;
}> = ({ project, activeId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sectionClickHandler = useCallback(
    (id) => {
      const search = createSearchParams(searchParams);

      search.set("s", id);

      navigate({ search: `?${search}` }, { replace: true });
    },
    [navigate, searchParams]
  );

  return useObserver(() => {
    return (
      <div>
        {project.sections.map((section, i) => {
          return (
            <SectionListRow
              key={i}
              selected={activeId === section.id}
              section={section}
              onSectionClick={sectionClickHandler}
            />
          );
        })}
      </div>
    );
  });
};

const NodesTree: FC<{
  section: Section;
}> = ({ section }) => {
  const [expanded, setExpanded] = useState<string[]>(() => []);

  const visibleNodesRef = useRef<Record<string, MkNode>>({});

  useLayoutEffect(() => {
    setExpanded(section.nodes.map((n) => n.id));
  }, [section]);

  const expanderClickHandler = useCallback((id: string) => {
    setExpanded((prev) => {
      const index = prev.indexOf(id);
      const next = [...prev];

      if (index === -1) {
        next.push(id);
      } else {
        next.splice(index, 1);
      }

      return next;
    });
  }, []);

  const nodeClickHandler = useCallback((id: string) => {
    runInAction(() => {
      editorState.selected = visibleNodesRef.current[id];
    });
  }, []);

  const renderNode = (node: MkNode, level: number, i: number) => {
    const { selected } = editorState;

    visibleNodesRef.current[node.id] = node;

    return (
      <NodeTreeRow
        key={i}
        node={node}
        selected={selected === node}
        expanded={expanded.includes(node.id)}
        hasChildren={node.children.length > 0}
        level={level}
        onExpanderClick={expanderClickHandler}
        onNodeClick={nodeClickHandler}
      />
    );
  };

  function grubNodes(
    nodes: MkNode[],
    level: number = 0,
    views: ReactNode[] = []
  ) {
    for (const node of nodes) {
      views.push(renderNode(node, level, views.length));

      if (!expanded.includes(node.id)) continue;

      grubNodes(node.children, level + 1, views);
    }

    return views;
  }

  return useObserver(() => {
    visibleNodesRef.current = {};

    return <div>{grubNodes(section.nodes)}</div>;
  });
};

export const ProjectEditor = observer<{ project: Project }>(({ project }) => {
  const [searchParams] = useSearchParams();

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerSize = useElementSize(viewerContainerRef);

  const section = project.sections.find((s) => s.id === searchParams.get("s"));

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
        <ObjectsContainer
          style={{
            width: 240,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <div style={{ borderBottom: "solid 1px #0002" }}>
            <SectionsList project={project} activeId={section?.id} />
          </div>
          <div>{section ? <NodesTree section={section} /> : null}</div>
        </ObjectsContainer>
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
