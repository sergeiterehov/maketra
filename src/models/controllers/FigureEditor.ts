import { action, makeObservable, observable } from "mobx";
import { Vector2d } from "../../utils/Transform";
import { Figure } from "../Figure";
import { FControl, FLink, FPoint } from "../FPoint";
import { MkNode } from "../MkNode";

export class FigureEditorNode extends MkNode {}

export class FigureEditorPoint extends FigureEditorNode {
  constructor(public editor: FigureEditor, public point: FPoint) {
    super();

    makeObservable(this);
  }

  @action realign() {
    const { point } = this;

    this.x = point.x;
    this.y = point.y;
  }

  @action moveBy(dx: number, dy: number) {
    const { point } = this;

    point.x += dx;
    point.y += dy;

    this.x = point.x;
    this.y = point.y;
  }
}

export class FigureEditorControl extends FigureEditorNode {
  constructor(
    public editor: FigureEditor,
    public point: FPoint,
    public link: FLink,
    public control: FControl
  ) {
    super();

    makeObservable(this);
  }

  @action realign() {
    const { control } = this;

    this.x = control.x;
    this.y = control.y;
  }

  @action moveBy(dx: number, dy: number) {
    const { control } = this;

    control.x += dx;
    control.y += dy;

    this.x = control.x;
    this.y = control.y;
  }
}

export class FigureEditor extends FigureEditorNode {
  name = "Figure Editor";

  @observable target?: Figure;

  @observable controlsMode = false;
  @observable singleControlMode = false;

  mapPointToNode = new Map<FPoint, FigureEditorPoint>();
  mapControlToNode = new Map<FControl, FigureEditorControl>();

  mouseDownPosition: Vector2d = { x: 0, y: 0 };
  mouseDownNode?: FigureEditorNode;
  prevMousePosition: Vector2d = { x: 0, y: 0 };

  constructor() {
    super();

    makeObservable(this);
  }

  @action setTarget(target?: Figure) {
    this.target = target;
    this.realign();
  }

  @action final() {
    const { target } = this;

    if (target) target.adjustPointsAndSize();
  }

  @action setControlsMode(state: boolean) {
    this.controlsMode = state;
  }

  @action setSingleControlMode(state: boolean) {
    this.singleControlMode = state;
  }

  @action onMouseDown(position: Vector2d, node?: MkNode) {
    if (!node) return;
    if (!(node instanceof FigureEditorNode)) return;

    this.mouseDownPosition = position;
    this.prevMousePosition = position;
    this.mouseDownNode = node;
  }

  @action onMouseMove(position: Vector2d) {
    const { mouseDownNode } = this;

    if (!mouseDownNode) return;

    const mouseDelta: Vector2d = {
      x: position.x - this.prevMousePosition.x,
      y: position.y - this.prevMousePosition.y,
    };

    if (mouseDownNode instanceof FigureEditorPoint) {
      mouseDownNode.moveBy(mouseDelta.x, mouseDelta.y);
    } else if (mouseDownNode instanceof FigureEditorControl) {
      // Проверяем возможность синхронного перемещения противоположной точки.
      if (!this.singleControlMode && mouseDownNode.point.links.length === 2) {
        const oppositeLink =
          mouseDownNode.point.links[0] === mouseDownNode.link
            ? mouseDownNode.point.links[1]
            : mouseDownNode.point.links[0];
        const opposite = oppositeLink.getControlFor(mouseDownNode.point);

        if (
          opposite.x === -mouseDownNode.control.x &&
          opposite.y === -mouseDownNode.control.y
        ) {
          const oppositeNode = this.mapControlToNode.get(opposite);

          oppositeNode?.moveBy(-mouseDelta.x, -mouseDelta.y);
        }
      }

      mouseDownNode.moveBy(mouseDelta.x, mouseDelta.y);
    }

    this.prevMousePosition = position;
  }

  @action onMouseUp() {
    this.mouseDownNode = undefined;
  }

  @action realign() {
    const { mapPointToNode, mapControlToNode, target } = this;

    const controls: FControl[] = [];

    if (target) {
      const transform = target.absoluteTransform;
      const { x, y } = transform.decompose();

      this.x = x;
      this.y = y;

      for (const point of target.points) {
        if (mapPointToNode.has(point)) continue;

        const pointNode = new FigureEditorPoint(this, point);

        mapPointToNode.set(point, pointNode);
        pointNode.appendTo(this);
      }

      for (const point of target.points) {
        for (const link of point.links) {
          if (!controls.includes(link.aControl)) controls.push(link.aControl);
          if (!controls.includes(link.bControl)) controls.push(link.bControl);

          if (!mapControlToNode.has(link.aControl)) {
            const aNode = new FigureEditorControl(
              this,
              link.a,
              link,
              link.aControl
            );

            mapControlToNode.set(link.aControl, aNode);
            aNode.appendTo(mapPointToNode.get(link.a)!);
          }

          if (!mapControlToNode.has(link.bControl)) {
            const bNode = new FigureEditorControl(
              this,
              link.b,
              link,
              link.bControl
            );

            mapControlToNode.set(link.bControl, bNode);
            bNode.appendTo(mapPointToNode.get(link.b)!);
          }
        }
      }
    }

    for (const [point, pointNode] of mapPointToNode) {
      if (target && target.points.includes(point)) {
        pointNode.realign();
      } else {
        mapPointToNode.delete(point);
        pointNode.destroy();
      }
    }

    for (const [control, controlNode] of mapControlToNode) {
      if (controls.includes(control)) {
        controlNode.realign();
      } else {
        mapControlToNode.delete(control);
        controlNode.destroy();
      }
    }
  }
}
