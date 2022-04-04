import { action, makeObservable, observable } from "mobx";
import { Figure } from "../Figure";
import { FControl, FLink, FPoint } from "../FPoint";
import { MkNode } from "../MkNode";

export class FigureEditorNode extends MkNode {}

export class FigureEditorPoint extends FigureEditorNode {
  constructor(public editor: FigureEditor, public point: FPoint) {
    super();

    makeObservable(this);
  }

  @action
  realign() {
    const { point } = this;

    this.x = point.x;
    this.y = point.y;
  }

  @action
  moveBy(dx: number, dy: number) {
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

  @action
  realign() {
    const { control } = this;

    this.x = control.x;
    this.y = control.y;
  }

  @action
  moveBy(dx: number, dy: number) {
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

  mapPointToNode = new Map<FPoint, FigureEditorPoint>();
  mapControlToNode = new Map<FControl, FigureEditorControl>();

  constructor() {
    super();

    makeObservable(this);
  }

  @action
  setTarget(target?: Figure) {
    this.target = target;
    this.realign();
  }

  @action
  realign() {
    const { mapPointToNode, mapControlToNode, target } = this;

    if (target) {
      const transform = target.absoluteTransform;
      const { x, y } = transform.decompose();

      this.x = x;
      this.y = y;

      const controls: FControl[] = [];

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

      for (const [point, pointNode] of mapPointToNode) {
        if (target.points.includes(point)) {
          pointNode.realign();
        } else {
          mapPointToNode.delete(point);
          pointNode.remove();
        }
      }

      for (const [control, controlNode] of mapControlToNode) {
        if (controls.includes(control)) {
          controlNode.realign();
        } else {
          mapControlToNode.delete(control);
          controlNode.remove();
        }
      }
    }
  }
}
