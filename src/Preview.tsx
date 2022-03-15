import { autorun } from "mobx";
import { FC, useEffect, useRef } from "react";
import { figureEditor } from "./figureEditor";
import { Section } from "./models/Section";
import { CanvasRenderer } from "./render/CanvasRenderer";
import { transformer } from "./transformer";

const fakeContext = document.createElement("canvas").getContext("2d")!;

export const Preview: FC<{
  section: Section;
  width: number;
  height: number;
}> = ({ width, height, section }) => {
  const pixelRatio = window.devicePixelRatio;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    rendererRef.current = new CanvasRenderer(fakeContext, context);
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;

    if (!renderer) return;

    const draw = () => {
      renderer.clear();

      for (const node of section.nodes) {
        renderer.renderNode(node);
      }

      renderer.renderNode(transformer.group);
      renderer.renderNode(figureEditor.group);
    };

    return autorun(draw);
  }, [section]);

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelRatio}
      height={height * pixelRatio}
      style={{ width, height }}
    />
  );
};
