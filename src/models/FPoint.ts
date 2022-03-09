import { computed, makeObservable, observable } from "mobx";

export class FControl {
  @observable public x: number;
  @observable public y: number;

  constructor(x: number = 0, y: number = x) {
    this.x = x;
    this.y = y;

    makeObservable(this);
  }
}

export class FLink {
  @observable public a: FPoint;
  @observable public b: FPoint;
  @observable public aControl: FControl;
  @observable public bControl: FControl;

  constructor(a: FPoint, b: FPoint) {
    this.a = a;
    this.b = b;
    this.aControl = new FControl();
    this.bControl = new FControl();

    makeObservable(this);
  }

  getControlFor(point: FPoint) {
    if (point === this.a) return this.aControl;

    return this.bControl;
  }
}

export class FPoint {
  /**
   * Создает начальную точку и возвращает ее.
   *
   * @param x X
   * @param y Y
   */
  public static start(x: number = 0, y: number = 0) {
    return new FPoint(x, y);
  }

  public static createLine(
    ax: number,
    ay: number,
    bx: number,
    by: number
  ): FPoint[] {
    return FPoint.start(ax, ay).lineTo(bx, by).allPoints;
  }

  public static createRect(
    x: number,
    y: number,
    w: number,
    h: number
  ): FPoint[] {
    return FPoint.start(x, y).line(w, 0).line(0, h).line(-w, 0).loop()
      .allPoints;
  }

  @observable public x: number = 0;
  @observable public y: number = 0;
  
  @observable public links: FLink[] = [];
  
  // TODO: corner radius

  constructor(
    x: number,
    y: number,
  ) {
    this.x = x;
    this.y = y;

    makeObservable(this);
  }

  /**
   * Возвращает все соседние точки.
   */
  @computed public get linkedPoints(): FPoint[] {
    const points: FPoint[] = [];

    for (const link of this.links) {
      const point = link.a === this ? link.b : link.a;

      if (!points.includes(point)) {
        points.push(point);
      }
    }

    return points;
  }

  /**
   * Все точки по связям.
   */
  @computed public get allPoints(): FPoint[] {
    const result: FPoint[] = [];
    let lookup: FPoint[] = [this];

    while (lookup.length) {
      const point = lookup.pop()!;

      if (result.includes(point)) continue;

      result.push(point);
      lookup.push(...point.linkedPoints);
    }

    return result;
  }

  public getLinkWith(point: FPoint): FLink | undefined {
    for (const link of this.links) {
      if (link.a === point || link.b === point) {
        return link;
      }
    }
  }

  /**
   * Присоединяет точку.
   *
   * @param other Присоединяемая точка.
   */
  public connect(other: FPoint) {
    const link = new FLink(this, other);

    this.links.push(link);
    other.links.push(link);

    return this;
  }

  /**
   * Присоединяет точку и возвращает ее.
   *
   * @param next Присоединяемая точка.
   */
  public next(next: FPoint) {
    this.connect(next);

    return next;
  }

  /**
   * Замыкает текущую точку на Еву.
   */
  public loop() {
    const checked: FPoint[] = [this];
    let lookup = [...this.linkedPoints];

    while (lookup.length) {
      const point = lookup.pop()!;

      if (checked.includes(point)) continue;

      if (point.links.length <= 1) {
        point.connect(this);
        break;
      }

      checked.push(point);
      lookup.push(...point.linkedPoints);
    }

    return this;
  }

  /**
   * Формирует линию до указанных координат и возвращает следующую точку.
   *
   * @param x X.
   * @param y Y.
   */
  public lineTo(x: number, y: number): FPoint {
    return this.next(new FPoint(x, y));
  }

  /**
   * Формирует линию смещением и возвращает следующую точку.
   *
   * @param dx Смещение X.
   * @param dy Смещение Y.
   */
  public line(dx: number, dy: number): FPoint {
    return this.next(new FPoint(this.x + dx, this.y + dy));
  }
}
