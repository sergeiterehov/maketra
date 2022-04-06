import { action, observable } from "mobx";
import { figureEditor } from "./figureEditor";
import { Area } from "./models/Area";
import { MkNode } from "./models/MkNode";
import { Project } from "./models/Project";
import { Section } from "./models/Section";
import { Transform } from "./utils/Transform";

export enum ToolMode {
  Transformer = 1,
  Hand,
  AreaAdder,
  TextAdder,
  PointEditor,
  PointBender,

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
      }

      return this;
    },

    changeTool(tool: ToolMode) {
      if (tool === this.tool) return;

      // Сперва завершаем работу с предыдущим инструментом
      switch (this.tool) {
        case ToolMode.PointBender:
        case ToolMode.PointEditor: {
          figureEditor.final();

          break;
        }
      }

      this.tool = tool;

      // Далее применяем новый инструмент
      switch (this.tool) {
        case ToolMode.PointBender:
        case ToolMode.PointEditor: {
          figureEditor.realign();

          break;
        }
      }
    },
  },
  {
    select: action,
    changeTool: action,
  }
);
