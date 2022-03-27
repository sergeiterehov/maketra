import { observer } from "mobx-react-lite";
import { FC, useEffect } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { editorState } from "./editorState";
import { ProjectEditor } from "./ProjectEditor";
import space from "./space";

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

const ProjectEditorView = observer(() => {
  const { projectId } = useParams();
  const project = space.projects.find((p) => p.id === projectId);

  useEffect(() => {
    editorState.select(project);
  }, [project]);

  return <ProjectEditor />;
});

function Maketra() {
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
