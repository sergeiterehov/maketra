import { action, observable } from "mobx";
import { figureEditor } from "./figureEditor";
import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { MkNode } from "./models/MkNode";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { transformer } from "./transformer";
import { Transform } from "./utils/Transform";

export enum ToolMode {
  Transformer = 1,
  Hand,
  AreaAdder,
  TextAdder,
  FigureEditor,
  PointBender,
  PointPen,

  Default = Transformer,
}

export const editorState = observable(
  {
    project: undefined as Project | undefined,
    section: undefined as Section | undefined,
    selected: undefined as MkNode | undefined,

    /** Активный инструмент. */
    tool: ToolMode.Default,

    /** Создаваемая в данный момент Область. */
    creatingArea: undefined as Area | undefined,

    /** Множитель пикселей: сколько пикселей рисуется на 1 единицу. */
    pixelRatio: devicePixelRatio,

    /** Трансформация области превью. */
    baseTransform: new Transform().scale(devicePixelRatio, devicePixelRatio),

    select(object?: MkNode | Project | Section) {
      if (object instanceof Project) {
        this.selected = undefined;
        this.section = undefined;
        this.project = object;
      } else if (object instanceof Section) {
        this.selected = undefined;
        this.section = object;
      } else {
        this.selected = object;

        transformer.adjust(object);
      }

      return this;
    },

    changeTool(tool: ToolMode) {
      const prevTool = this.tool;

      if (tool === prevTool) return;

      this.tool = tool;

      // Сперва завершаем работу с предыдущим инструментом

      if (
        (prevTool === ToolMode.FigureEditor ||
          prevTool === ToolMode.PointPen ||
          prevTool === ToolMode.PointBender) &&
        tool !== ToolMode.FigureEditor &&
        tool !== ToolMode.PointPen &&
        tool !== ToolMode.PointBender
      ) {
        figureEditor.final();
      }

      // Далее применяем новый инструмент

      if (tool === ToolMode.PointPen) {
        figureEditor.setCreating(true);
      } else if (tool === ToolMode.FigureEditor) {
        figureEditor.setTarget(
          this.selected instanceof Figure ? this.selected : undefined
        );
      }
    },
  },
  {
    select: action,
    changeTool: action,
  }
);
