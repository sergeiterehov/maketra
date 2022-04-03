import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import styled from "styled-components";
import { API } from "./api";
import { appState, UserGender } from "./appState";
import { editorState } from "./editorState";
import { ProjectEditor } from "./ProjectEditor";
import space from "./space";

const ProjectPreview = styled(
  observer<{
    id: string;
    name: string;
    description: string;
    className?: string;
  }>(({ className, id, name, description }) => {
    return (
      <Link className={className} to={`/${id}`}>
        <div className="project-preview-name">{name}</div>
        <div className="project-preview-description">{description}</div>
      </Link>
    );
  })
)`
  display: block;
  color: inherit;
  text-decoration: none;

  .project-preview-name {
    font-weight: 500;
  }

  .project-preview-description {
    color: var(--color-fg-disabled);
  }
`;

const ProjectsView = styled(
  observer<{ className?: string }>(({ className }) => {
    return (
      <div className={className}>
        <h1>Макетра</h1>
        <h2>Проекты</h2>
        {!space.projects.length ? (
          <div>У вас еще нет ни одного проекта</div>
        ) : null}
        <div>
          {space.projects.map((project) => (
            <ProjectPreview
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
            />
          ))}
        </div>
      </div>
    );
  })
)`
  padding: 13px;
`;

const ProjectEditorView = observer(() => {
  const { projectId } = useParams();
  const project = space.projects.find((p) => p.id === projectId);

  useEffect(() => {
    editorState.select(project);
  }, [project]);

  return <ProjectEditor />;
});

function Maketra() {
  useEffect(() => {
    API.User.get()
      .then((user) => {
        appState.setUser({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          sex: user.sex as UserGender,
          yandexAvatarId: user.yandexAvatarId,
          yandexId: user.yandexAvatarId,
        });
      })
      .catch(() => {
        appState.setUser(undefined);
      });
  }, []);

  return (
    <>
      <Routes>
        <Route index element={<ProjectsView />} />
        <Route path="/:projectId" element={<ProjectEditorView />} />
      </Routes>
    </>
  );
}

export default Maketra;
