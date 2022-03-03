import { Path } from "konva/lib/shapes/Path";
import { action, computed, makeObservable, observable, observe } from "mobx";
import { Primitive } from "./Primitive";

export class Figure extends Primitive {
  public name: string = "Figure";

  @observable public path: string = "";
  @observable public backgroundColor: string = "#AAAAAA";
  @observable public strokeColor: string = "#000000";
  @observable public strokeWidth: number = 1;

  @computed public get pathData(): any[] {
    return Path.parsePathData(this.path);
  }

  constructor() {
    super();

    makeObservable(this);

    observe(this, "pathData", () => this.adjustPointsAndSize());
  }

  @action
  protected adjustPointsAndSize() {
    let xMin = +Infinity;
    let yMin = +Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;

    for (const { points: p } of this.pathData) {
      if (p.length < 2) continue;

      if (p[0] < xMin) xMin = p[0];
      if (p[0] > xMax) xMax = p[0];
      if (p[1] < yMin) yMin = p[1];
      if (p[1] > yMax) yMax = p[1];
    }

    const x = xMin;
    const y = yMin;

    if (x || y) {
      for (const { points: p } of this.pathData) {
        if (p.length < 2) continue;

        p[0] -= x;
        p[1] -= y;
      }
    }

    this.width = xMax - xMin;
    this.height = yMax - yMin;
  }

  protected renderPathData(ctx: CanvasRenderingContext2D): void {
    const commands = this.pathData;
    let isClosed = false;

    ctx.beginPath();

    for (let n = 0; n < commands.length; n++) {
      const command = commands[n].command;
      const p = commands[n].points;

      switch (command) {
        case "L":
          ctx.lineTo(p[0], p[1]);

          break;
        case "M":
          ctx.moveTo(p[0], p[1]);

          break;
        case "C":
          ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);

          break;
        case "Q":
          ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);

          break;
        case "A":
          const cx = p[0];
          const cy = p[1];
          const rx = p[2];
          const ry = p[3];
          const theta = p[4];
          const dTheta = p[5];
          const psi = p[6];
          const fs = p[7];

          const r = rx > ry ? rx : ry;
          const scaleX = rx > ry ? 1 : rx / ry;
          const scaleY = rx > ry ? ry / rx : 1;

          ctx.translate(cx, cy);
          ctx.rotate(psi);
          ctx.scale(scaleX, scaleY);
          ctx.arc(0, 0, r, theta, theta + dTheta, Boolean(1 - fs));
          ctx.scale(1 / scaleX, 1 / scaleY);
          ctx.rotate(-psi);
          ctx.translate(-cx, -cy);

          break;
        case "z":
          isClosed = true;
          ctx.closePath();

          break;
      }
    }

    if (isClosed) {
      ctx.fill();
    }
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.backgroundColor;

    this.renderPathData(ctx);

    if (this.strokeWidth) {
      ctx.lineWidth = this.strokeWidth;
      ctx.strokeStyle = this.strokeColor;
      ctx.stroke();
    }
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    this.renderPathData(ctx);

    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
