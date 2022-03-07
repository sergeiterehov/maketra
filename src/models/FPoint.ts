import { computed, makeObservable, observable } from "mobx";

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

  @observable public links: FPoint[] = [];

  @observable public x: number = 0;
  @observable public y: number = 0;

  @observable public xBefore: number = 0;
  @observable public yBefore: number = 0;
  @observable public xAfter: number = 0;
  @observable public yAfter: number = 0;

  // TODO: corner radius

  constructor(
    x: number,
    y: number,
    xAfter: number = 0,
    yAfter: number = 0,
    xBefore?: number,
    yBefore?: number,
    parent?: FPoint
  ) {
    if (parent) {
      this.links.push(parent);
      parent.links.push(this);
    }

    this.x = x;
    this.y = y;

    this.xAfter = xAfter;
    this.yAfter = yAfter;
    this.xBefore = xBefore === undefined ? -xAfter : 0;
    this.yBefore = yBefore === undefined ? -yAfter : 0;

    makeObservable(this);
  }

  /** Все точки по связям. */
  @computed public get allPoints(): FPoint[] {
    const result: FPoint[] = [];
    let lookup: FPoint[] = [this];

    while (lookup.length) {
      const point = lookup.pop()!;

      if (result.includes(point)) continue;

      result.push(point);
      lookup.push(...point.links);
    }

    return result;
  }

  /**
   * Присоединяет себя к начальной точке.
   *
   * @param parent Родительская точка.
   */
  public after(parent: FPoint) {
    this.links.push(parent);
    parent.links.push(this);

    return this;
  }

  /**
   * Присоединяет продолжающие точки и возвращает себя.
   *
   * @param children Присоединяемые точки.
   */
  public before(...children: FPoint[]) {
    for (const child of children) {
      child.links.push(this);
      this.links.push(child);
    }

    return this;
  }

  /**
   * Присоединяет точку и возвращает ее.
   *
   * @param next Присоединяемая точка.
   */
  public next(next: FPoint) {
    next.links.push(this);
    this.links.push(next);

    return next;
  }

  /**
   * Замыкает текущую точку на Еву.
   */
  public loop() {
    const checked: FPoint[] = [this];
    let lookup = [...this.links];

    while (lookup.length) {
      const point = lookup.pop()!;

      if (checked.includes(point)) continue;

      if (point.links.length <= 1) {
        point.links.push(this);
        this.links.push(point);
        break;
      }

      checked.push(point);
      lookup.push(...point.links);
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
