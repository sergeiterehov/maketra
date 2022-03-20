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
  @observable public fontFamily: string = "Arial";
  @observable public fontSize: number = 14;
  @observable public fontSizeUnit: FontSizeUnit = FontSizeUnit.Pixel;
  @observable public fontWeight: FontWeight = FontWeight.Regular;
  @observable public fontStyle: FontStyle = FontStyle.Normal;

  get size(): Size {
    return { width: this.computedTextWidth, height: this.computedTextHeight };
  }

  @computed public get font(): string {
    const { fontFamily, fontSizeUnit, fontSize, fontWeight, fontStyle } = this;

    return `${fontWeight} ${fontStyle} ${fontSize}${fontSizeUnit} ${fontFamily}`;
  }

  @computed public get computedTextWidth(): number {
    const { textLines, font } = this;
    let width = 0;

    for (const line of textLines) {
      width = Math.max(width, measureTextWidth(line, font));
    }

    return width;
  }

  @computed public get computedTextHeight(): number {
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
}
