import { observer, Observer } from "mobx-react-lite";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { PropsContainer } from "./PropsContainer";
import { MkNode } from "./models/MkNode";
import { Project } from "./models/Project";
import { NodeProps } from "./NodeProps";
import { useElementSize } from "./utils/useElementSize";
import { editorState } from "./editorState";
import { NodeTreeRow } from "./components/NodeTreeRow";
import { SectionListRow } from "./components/SectionListRow";
import { runInAction } from "mobx";
import { ObjectsContainer } from "./ObjectsContainer";
import { Toolbar } from "./Toolbar";
import { Viewer } from "./Viewer";

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

  return (
    <Observer>
      {() => {
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
      }}
    </Observer>
  );
};

const NodesTree: FC = observer(() => {
  const [expanded, setExpanded] = useState<string[]>(() => []);

  const visibleNodesRef = useRef<Record<string, MkNode>>({});

  const { section, selected } = editorState;

  useLayoutEffect(() => {
    if (!section) return;

    setExpanded(section.nodes.map((n) => n.id));
  }, [section]);

  useEffect(() => {
    setExpanded((prev) => {
      const adding: string[] = [];
      let lookup: MkNode | undefined = selected;

      while (lookup) {
        if (!prev.includes(lookup.id)) {
          adding.push(lookup.id);
        }

        lookup = lookup.parentNode;
      }

      if (adding.length) {
        return [...prev, ...adding];
      }

      return prev;
    });
  }, [selected]);

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

  visibleNodesRef.current = {};

  if (!section) return null;

  return <div>{grubNodes(section.nodes)}</div>;
});

export const ProjectEditor = observer(() => {
  const [searchParams] = useSearchParams();

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerSize = useElementSize(viewerContainerRef);

  const { project, section } = editorState;

  const sectionIdFromSearch = searchParams.get("s");

  useEffect(() => {
    const nextSection = project?.sections.find((s) => s.id === sectionIdFromSearch);

    editorState.select(nextSection);
  }, [project, sectionIdFromSearch]);

  if (!project) return null;

  return (
    <div
      style={{
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar />
      <div style={{ display: "flex", height: "100%" }}>
        <ObjectsContainer
          style={{
            width: 240,
            height: "100%",
            flexShrink: 0,
            borderRight: "solid 1px var(--color-border)",
          }}
        >
          <div style={{ borderBottom: "solid 1px var(--color-border)" }}>
            <SectionsList project={project} activeId={section?.id} />
          </div>
          <div>{section ? <NodesTree /> : null}</div>
        </ObjectsContainer>
        <div
          ref={viewerContainerRef}
          style={{ width: "100%", overflow: "hidden" }}
        >
          {section && viewerContainerSize ? (
            <Viewer
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
            borderLeft: "solid 1px var(--color-border)",
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
