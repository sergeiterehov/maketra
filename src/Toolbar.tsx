import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { editorState } from "./editorState";

export const ToolbarButton = styled.div`
  width: 40px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToolbarContainer = styled.div`
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

  .toolbar-project-selector {
    color: inherit;
    text-decoration: none;
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

    &[data-active] {
      background-color: var(--color-focus);
      color: var(--color-focus-fg);
    }
  }
`;

export const Toolbar = styled(
  observer(() => {
    const { project } = editorState;

    return (
      <ToolbarContainer>
        <div className="toolbar-section toolbar-section-logo">
          <ToolbarButton>
            <span style={{ fontSize: 16 }}>М</span>
          </ToolbarButton>
        </div>
        <div className="toolbar-section toolbar-section-left">
          <ToolbarButton data-active={""}>
            <span style={{ fontSize: 20 }}>&#9651;</span>
          </ToolbarButton>
          <ToolbarButton>
            <span style={{ fontSize: 20 }}>&#10693;</span>
          </ToolbarButton>
          <ToolbarButton>
            <span style={{ fontSize: 24 }}>&#9191;</span>
          </ToolbarButton>
          <ToolbarButton>
            <span style={{ fontSize: 16 }}>Т</span>
          </ToolbarButton>
        </div>
        <div className="toolbar-section toolbar-section-center">
          {project ? (
            <Link className="toolbar-project-selector" to="/">
              {project.name}
            </Link>
          ) : (
            "Maketra"
          )}
        </div>
        <div className="toolbar-section toolbar-section-right">Войти</div>
      </ToolbarContainer>
    );
  })
).withConfig({ displayName: "Toolbar" })``;
