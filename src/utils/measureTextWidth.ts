const fakeCanvas = document.createElement("canvas");
const fakeCtx = fakeCanvas.getContext("2d")!;

export function measureTextWidth(text: string, font: string): number {
  fakeCtx.font = font;

  return fakeCtx.measureText(text).width;
}
