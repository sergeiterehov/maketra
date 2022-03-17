import { runInAction } from "mobx";
import { useObserver } from "mobx-react-lite";
import { FC, memo, ReactNode, useCallback } from "react";
import styled from "styled-components";
import { Area } from "../models/Area";
import { MkNode } from "../models/MkNode";
import { RowSpanInput } from "./RowSpanInput";

const Indent = styled<
  FC<{
    className?: string;
    id: string;
    level: number;
    expanded: boolean;
    hasChildren: boolean;
    onExpanderClick(id: string): void;
  }>
>(
  memo(
    ({
      className,
      id,
      level,
      children,
      expanded,
      hasChildren,
      onExpanderClick,
    }) => {
      const indents: ReactNode[] = [];

      for (let i = 0; i <= level; i += 1) {
        indents.push(<span key={i} className="indent-spacer" />);
      }

      const expanderClickHandler: React.MouseEventHandler<HTMLSpanElement> =
        useCallback(
          (e) => {
            e.preventDefault();
            e.stopPropagation();

            onExpanderClick(id);
          },
          [id, onExpanderClick]
        );

      return (
        <span className={className}>
          {indents}
          {hasChildren ? (
            <span
              className="indent-spacer indent-expander"
              onClick={expanderClickHandler}
            >
              {expanded ? <>&#9662;</> : <>&#9656;</>}
            </span>
          ) : null}
        </span>
      );
    }
  )
).withConfig({ displayName: "Indent" })`
  display: flex;
  position: relative;
  height: 100%;
  flex-shrink: 0;

  .indent-spacer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    height: 100%;
    width: 16px;
  }

  .indent-expander {
    position: absolute;
    top: 0;
    right: 0;

    color: var(--color-icon);
  }
`;

export const NodeTreeRow = styled<
  FC<{
    className?: string;
    level: number;
    node: MkNode;
    expanded: boolean;
    selected: boolean;
    hasChildren: boolean;
    onExpanderClick(id: string): void;
    onNodeClick(id: string): void;
  }>
>(
  ({
    className,
    level,
    node,
    expanded,
    selected,
    hasChildren,
    onExpanderClick,
    onNodeClick,
  }) => {
    const clickHandler: React.MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        onNodeClick(node.id);
      },
      [node, onNodeClick]
    );

    const nameChangeHandler = useCallback(
      (newName: string) => {
        runInAction(() => {
          node.name = newName;
        });
      },
      [node]
    );

    return useObserver(() => {
      return (
        <div
          className={className}
          data-is-selected={selected ? "" : undefined}
          data-is-area={node instanceof Area ? "" : undefined}
          onClick={clickHandler}
        >
          <Indent
            id={node.id}
            level={level}
            expanded={expanded}
            hasChildren={hasChildren}
            onExpanderClick={onExpanderClick}
          />
          <RowSpanInput value={node.name} onChange={nameChangeHandler} />
        </div>
      );
    });
  }
).withConfig({ displayName: "NodeTreeRow" })`
  display: flex;
  position: relative;
  flex-shrink: 0;
  height: 32px;
  user-select: none;

  &[data-is-selected] {
    background-color: #00f2;
  }

  &[data-is-area] ${RowSpanInput} {
    font-weight: bold;
  }
`;
