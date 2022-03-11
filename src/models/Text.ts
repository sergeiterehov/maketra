import { computed, makeObservable, observable } from "mobx";
import { measureTextWidth } from "../utils/measureTextWidth";
import { Size } from "./MkNode";
import { Primitive } from "./Primitive";

export enum TextAlign {
  Left = "left",
  Right = "right",
  Center = "center",
}

export enum FontSizeUnit {
  Pixel = "px",
}

export enum FontStyle {
  Normal = "normal",
  Italic = "italic",
}

export enum FontWeight {
  Thin = "100",
  Hairline = Thin,
  ExtraLight = "200",
  UltraLight = ExtraLight,
  Light = "300",
  Normal = "normal",
  Regular = Normal,
  Medium = "500",
  SemiBold = "600",
  DemiBold = SemiBold,
  Bold = "bold",
  ExtraBold = "800",
  UltraBold = ExtraBold,
  Black = "900",
  Heavy = Black,
}

export class Text extends Primitive {
  public name: string = "Text";

  @observable public text: string = "Sample";
  @observable public textAlign: TextAlign = TextAlign.Left;
  @observable public fontFamily: string = "monospace";
  @observable public fontSize: number = 14;
  @observable public fontSizeUnit: FontSizeUnit = FontSizeUnit.Pixel;
  @observable public fontWeight: FontWeight = FontWeight.Regular;
  @observable public fontStyle: FontStyle = FontStyle.Normal;

  get size(): Size {
    return { width: this.computedTextWidth, height: this.computedTextHeight };
  }

  @computed protected get font(): string {
    const { fontFamily, fontSizeUnit, fontSize, fontWeight, fontStyle } = this;

    return `${fontWeight} ${fontStyle} ${fontSize}${fontSizeUnit} ${fontFamily}`;
  }

  @computed protected get computedTextWidth(): number {
    const { textLines, font } = this;
    let width = 0;

    for (const line of textLines) {
      width = Math.max(width, measureTextWidth(line, font));
    }

    return width;
  }

  @computed protected get computedTextHeight(): number {
    const { textLines, fontSize } = this;

    return textLines.length * fontSize;
  }

  @computed public get textLines() {
    const { text } = this;

    return text.split("\n");
  }

  constructor() {
    super();

    makeObservable(this);
  }

  protected drawView(ctx: CanvasRenderingContext2D): void {
    const { fills, font, textLines, fontSize, textAlign, computedTextWidth } =
      this;

    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.textAlign = textAlign as any;

    let alignOffset = 0;

    switch (textAlign) {
      case TextAlign.Center:
        alignOffset = computedTextWidth / 2;
        break;
      case TextAlign.Right:
        alignOffset = computedTextWidth;
        break;
      default:
    }

    for (let i = 0; i < textLines.length; i += 1) {
      const line = textLines[i];

      for (const fill of fills) {
        fill.apply(ctx);
        ctx.fillText(line, alignOffset, i * fontSize);
      }
    }
  }

  protected drawHit(ctx: CanvasRenderingContext2D): void {
    const { computedTextHeight, computedTextWidth } = this;

    ctx.fillRect(0, 0, computedTextWidth, computedTextHeight);
  }
}
