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

    this.apply();
  }

  @action moveTo(x: number, y: number) {
    const { point } = this;

    point.x = x;
    point.y = y;

    this.apply();
  }

  @action apply() {
    const { point } = this;

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
  @observable freeMovementMode = false;

  // TODO: нужен колбек на создание фигуры.
  // Если нет таргета, то рисуется точка создания.
  // Если нажимаем без таргета, то делается вызов на создание фигуры. Ставится фокус и начинается редактирование.
  // Так как мы остаемся в режиме добавления, то продолжаем рисование.
  // В режиме добавления есть указатель на добавляемую точку. Это свойство, а не узел!

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

  @action setFreeMovementMode(state: boolean) {
    this.freeMovementMode = state;
  }

  @action onMouseDown(position: Vector2d, node?: MkNode) {
    if (!node) return;
    if (!(node instanceof FigureEditorNode)) return;

    this.mouseDownPosition = position;
    this.prevMousePosition = position;
    this.mouseDownNode = node;
  }

  @action onMouseMove(position: Vector2d) {
    const { mouseDownNode, target, freeMovementMode } = this;

    if (!mouseDownNode || !target) return;

    const { x, y } = target.absoluteTransform.decompose();

    const mousePosition: Vector2d = {
      x: position.x - x,
      y: position.y - y,
    };

    const mouseDelta: Vector2d = {
      x: position.x - this.prevMousePosition.x,
      y: position.y - this.prevMousePosition.y,
    };

    if (mouseDownNode instanceof FigureEditorPoint) {
      const { points } = target;

      let lx = mousePosition.x;
      let ly = mousePosition.y;

      // Помощник выравнивания
      if (!freeMovementMode) {
        let xNearest: FPoint | null = null;
        let yNearest: FPoint | null = null;

        let dx = Infinity;
        let dy = Infinity;

        for (const point of points) {
          if (point === mouseDownNode.point) continue;

          const pdx = Math.abs(point.x - mousePosition.x);
          const pdy = Math.abs(point.y - mousePosition.y);

          if (pdx < 8 && pdx < dx) {
            dx = pdx;
            xNearest = point;
          }

          if (pdy < 8 && pdy < dy) {
            dy = pdy;
            yNearest = point;
          }
        }

        if (xNearest) lx = xNearest.x;
        if (yNearest) ly = yNearest.y;
      }

      mouseDownNode.moveTo(lx, ly);
    } else if (mouseDownNode instanceof FigureEditorControl) {
      // Проверяем возможность синхронного перемещения противоположной точки.
      if (!freeMovementMode && mouseDownNode.point.links.length === 2) {
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
