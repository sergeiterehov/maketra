import { observer, Observer } from "mobx-react-lite";
import {
  FC,
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
import { ObjectsContainer } from "./ObjectsContainer";
import { Toolbar } from "./Toolbar";
import { Viewer } from "./Viewer";
import { Area } from "./models/Area";
import styled from "styled-components";

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

const NodesTree = styled(
  observer<{ className?: string }>(({ className }) => {
    const rowHeight = 32;
    const rowIndent = 16;

    const [expanded, setExpanded] = useState<string[]>(() => []);
    const [dragging, setDragging] = useState<string>();
    const [dropPlaceholder, setDropPlaceholder] = useState<{
      y: number;
      level: number;
      index: number;
      mode: "AFTER" | "BEFORE" | "INSIDE";
    }>();
    const [mouseTarget, setMouseTarget] = useState<string>();

    const visibleNodesRef = useRef<Record<string, MkNode>>({});
    const nodesListRef = useRef<{ node: MkNode; level: number }[]>([]);

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

        adding.shift();

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
      editorState.select(visibleNodesRef.current[id]);
    }, []);

    const nodeMouseEnterHandler = useCallback((id: string) => {
      setMouseTarget(id);
    }, []);

    const nodeDragStart = useCallback((id: string) => {
      setDragging(id);
    }, []);

    const mouseMoveHandler: React.MouseEventHandler<HTMLDivElement> =
      useCallback(
        (e) => {
          if (!dragging) return;

          const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
          const offset = y / rowHeight;
          const index = Math.floor(offset);
          const k = offset - index;
          const listItem = nodesListRef.current[index];

          if (!listItem) return;

          if (listItem.node instanceof Area) {
            if (expanded.includes(listItem.node.id) && k > 0.66) {
              setDropPlaceholder({
                level: listItem.level + 1,
                index: index + 1,
                y: (index + 1) * rowHeight,
                mode: "BEFORE",
              });
            } else {
              setDropPlaceholder({
                level: listItem.level,
                index,
                y: (index + (k > 0.66 ? 1 : 0)) * rowHeight,
                mode: k < 0.33 ? "BEFORE" : k > 0.66 ? "AFTER" : "INSIDE",
              });
            }
          } else {
            setDropPlaceholder({
              level: listItem.level,
              index,
              y: (index + (k > 0.5 ? 1 : 0)) * rowHeight,
              mode: k > 0.5 ? "AFTER" : "BEFORE",
            });
          }
        },
        [dragging, expanded]
      );

    const mouseUpHandler: React.MouseEventHandler<HTMLDivElement> =
      useCallback(() => {
        if (!dragging) return;
        if (!dropPlaceholder) return;

        setDragging(undefined);
        setDropPlaceholder(undefined);

        const dragItem = nodesListRef.current.find(
          (item) => item.node.id === dragging
        );

        if (!dragItem) return;

        const dropItem = nodesListRef.current[dropPlaceholder.index];

        if (!dropItem) return;

        if (dragItem.node === dropItem.node) return;

        switch (dropPlaceholder.mode) {
          case "INSIDE": {
            dragItem.node.appendTo(dropItem.node);
            break;
          }
          case "AFTER": {
            dragItem.node.appendNear(dropItem.node, true);
            break;
          }
          case "BEFORE": {
            dragItem.node.appendNear(dropItem.node, false);
            break;
          }
        }
      }, [dragging, dropPlaceholder]);

    visibleNodesRef.current = {};

    if (!section) return null;

    function grubNodes(
      nodes: MkNode[],
      level: number = 0,
      result: { node: MkNode; level: number }[] = []
    ) {
      for (const node of nodes) {
        result.push({ node, level });

        if (!expanded.includes(node.id)) continue;

        grubNodes(node.children, level + 1, result);
      }

      return result;
    }

    nodesListRef.current = grubNodes(section.nodes);

    return (
      <div
        className={className}
        onMouseUp={mouseUpHandler}
        onMouseMove={mouseMoveHandler}
      >
        {nodesListRef.current.map(({ node, level }, i) => {
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
              onDragStart={nodeDragStart}
              onMouseEnter={nodeMouseEnterHandler}
            />
          );
        })}
        {dropPlaceholder &&
          (dropPlaceholder.mode === "INSIDE" ? (
            <div
              style={{
                position: "absolute",
                top: dropPlaceholder.y,
                height: rowHeight,
                left: 0,
                right: 0,
                border: "solid 1px #000",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: dropPlaceholder.y - 1,
                left: (dropPlaceholder.level + 1) * rowIndent,
                right: 0,
                borderTop: "solid 2px #000",
                borderRadius: "2px 0 0 2px",
              }}
            />
          ))}
      </div>
    );
  })
).withConfig({ displayName: "NodesTree" })`
  position: relative;
`;

export const ProjectEditor = observer(() => {
  const [searchParams] = useSearchParams();

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerSize = useElementSize(viewerContainerRef);

  const { project, section } = editorState;

  const sectionIdFromSearch = searchParams.get("s");

  useEffect(() => {
    const nextSection = project?.sections.find(
      (s) => s.id === sectionIdFromSearch
    );

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
