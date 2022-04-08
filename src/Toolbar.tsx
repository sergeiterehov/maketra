import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { editorState, ToolMode } from "./editorState";
import { LoginButton } from "./LoginButton";

export const ToolbarButton = styled.div`
  width: 40px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToolPicker = observer<{ tool: ToolMode; className?: string }>(
  ({ tool, className, children }) => {
    const clickHandler = useCallback(() => {
      editorState.changeTool(tool);
    }, [tool]);

    return (
      <ToolbarButton
        className={className}
        data-active={editorState.tool === tool}
        onClick={clickHandler}
      >
        {children}
      </ToolbarButton>
    );
  }
);

const ProjectNameInput = styled.input`
  background-color: transparent;
  border: 0;
  padding: 0 6px;
  color: inherit;
  font-size: inherit;
  text-align: center;
`;

const ProjectName = styled(
  observer<{ className?: string }>(({ className }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState("");

    const { project } = editorState;

    const nameClickHandler = useCallback(() => {
      if (project) {
        setNewName(project.name);
      }

      setEditing(true);
    }, [project]);

    const nameChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
      useCallback((e) => {
        setNewName(e.currentTarget.value);
      }, []);

    const nameBlurHandler: React.FocusEventHandler<HTMLInputElement> =
      useCallback(
        (e) => {
          runInAction(() => {
            if (project) {
              project.name = e.currentTarget.value;
            }
          });

          setEditing(false);
        },
        [project]
      );

    const nameKeyDownHandler: React.KeyboardEventHandler<HTMLInputElement> =
      useCallback(
        (e) => {
          switch (e.code) {
            case "Enter":
              runInAction(() => {
                if (project) {
                  project.name = e.currentTarget.value;
                }
              });

              setEditing(false);
              break;
            case "Escape":
              setEditing(false);
              break;
          }
        },
        [project]
      );

    useLayoutEffect(() => {
      if (!editing) return;

      if (!inputRef.current) return;

      inputRef.current.focus();
      inputRef.current.select();
    }, [editing]);

    if (!project) return null;

    return (
      <div className={className}>
        {editing ? (
          <ProjectNameInput
            ref={inputRef}
            value={newName}
            onChange={nameChangeHandler}
            onKeyDown={nameKeyDownHandler}
            onBlur={nameBlurHandler}
          />
        ) : (
          <>
            <span onClick={nameClickHandler}>{project.name}</span>
            <Link className="project-name-back" to="/">
              &uarr;
            </Link>
          </>
        )}
      </div>
    );
  })
).withConfig({ displayName: "ProjectName" })`
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;

  .project-name-back {
    color: inherit;
    text-decoration: none;
    margin-left: 8px;
  }
`;

export const Toolbar = styled(
  observer<{ className?: string }>(({ className }) => {
    return (
      <div className={className}>
        <div className="toolbar-section toolbar-section-logo">
          <ToolbarButton>
            <span style={{ fontSize: 16 }}>М</span>
          </ToolbarButton>
        </div>
        <div className="toolbar-section toolbar-section-left">
          <ToolPicker tool={ToolMode.Transformer}>
            <span style={{ fontSize: 20 }}>&#9651;</span>
          </ToolPicker>
          <ToolPicker tool={ToolMode.AreaAdder}>
            <span style={{ fontSize: 20 }}>&#10693;</span>
          </ToolPicker>
          <ToolPicker tool={ToolMode.PointPen}>
            <span style={{ fontSize: 24 }}>&#9191;</span>
          </ToolPicker>
          <ToolPicker tool={ToolMode.TextAdder}>
            <span style={{ fontSize: 16 }}>Т</span>
          </ToolPicker>
        </div>
        <div className="toolbar-section toolbar-section-center">
          <ProjectName />
        </div>
        <div className="toolbar-section toolbar-section-right">
          <LoginButton />
        </div>
      </div>
    );
  })
).withConfig({ displayName: "Toolbar" })`
  display: flex;
  background-color: var(--color-bg-toolbar);
  color: var(--color-fg-toolbar);
  width: 100%;
  height: 48px;
  flex-shrink: 0;
  justify-content: space-between;

  .toolbar-section {
    display: flex;
    align-items: center;
  }

  .toolbar-section-left {
    flex-basis: 25%;
    justify-content: flex-start;
  }

  .toolbar-section-center {
    flex-basis: 50%;
    justify-content: center;
  }

  .toolbar-section-right {
    flex-basis: 25%;
    justify-content: flex-end;
  }

  ${ToolbarButton} {
    cursor: default;

    :hover {
      background-color: var(--color-bg-toolbar-hover);
    }

    &[data-active="true"] {
      background-color: var(--color-focus);
      color: var(--color-focus-fg);
    }
  }

  ${LoginButton} {
    padding: 0 13px;
  }
`;
