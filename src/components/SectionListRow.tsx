import { runInAction } from "mobx";
import { useObserver } from "mobx-react";
import { FC, useCallback } from "react";
import styled from "styled-components";
import { Section } from "../models/Section";
import { RowSpanInput } from "./RowSpanInput";

export const SectionListRow = styled<
  FC<{
    className?: string;
    section: Section;
    selected?: boolean;
    onSectionClick(id: string): void;
  }>
>(({ selected, section, className, onSectionClick }) => {
  const clickHandler: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      onSectionClick(section.id);
    },
    [section, onSectionClick]
  );

  const nameChangeHandler = useCallback(
    (newName: string) => {
      runInAction(() => {
        section.name = newName;
      });
    },
    [section]
  );

  return useObserver(() => {
    return (
      <div
        className={className}
        data-is-selected={selected ? "" : undefined}
        onClick={clickHandler}
      >
        <span className="section-list-row-marker">&#10003;</span>
        <RowSpanInput value={section.name} onChange={nameChangeHandler} />
      </div>
    );
  });
}).withConfig({ displayName: "SectionListRow" })`
  display: flex;
  position: relative;
  flex-shrink: 0;
  height: 32px;
  user-select: none;

  .section-list-row-marker {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    height: 100%;
    margin-left: 16px;
    margin-right: 8px;
    color: var(--color-icon);
  }

  &[data-is-selected] {
    font-weight: 500;
  }

  &:not([data-is-selected]) .section-list-row-marker {
    visibility: hidden;
  }
`;
