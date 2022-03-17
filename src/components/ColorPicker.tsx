import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import {
  changeAlpha,
  changeHue,
  changeRGB,
  Color,
  colorToCssString,
  getHueFromColor,
} from "../utils/Color";

// Здесь можно не делать pixelRatio

const Canvas: FC<{
  className?: string;
  width: number;
  height: number;
  onDraw(ctx: CanvasRenderingContext2D): void;
  onPick(x: number, y: number, ctx: CanvasRenderingContext2D): void;
}> = ({ className, width, height, onDraw, onPick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onPickRef = useRef(onPick);

  onPickRef.current = onPick;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    onDraw(ctx);
  }, [onDraw]);

  const mouseDownHandler: React.MouseEventHandler<HTMLCanvasElement> =
    useCallback(
      (eReact) => {
        const ctx = canvasRef.current!.getContext("2d");

        if (!ctx) return;

        eReact.preventDefault();
        eReact.stopPropagation();

        const mouseMoveHandler = (e: MouseEvent) => {
          const { left, top } = canvasRef.current!.getBoundingClientRect();

          const x = Math.min(width - 1, Math.max(0, e.clientX - left)) / width;
          const y = Math.min(height - 1, Math.max(0, e.clientY - top)) / height;

          onPickRef.current(x, y, ctx);
        };

        mouseMoveHandler(eReact.nativeEvent);

        const mouseUpHandler = () => {
          window.removeEventListener("mousemove", mouseMoveHandler);
          window.removeEventListener("mouseup", mouseUpHandler);
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
      },
      [height, width]
    );

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
      onMouseDown={mouseDownHandler}
    />
  );
};

const ColorBlock = styled<
  FC<{
    className?: string;
    size: number;
    color: Color;
    onChange(color: Color): void;
  }>
>(({ className, size, color, onChange }) => {
  return (
    <Canvas
      className={className}
      width={size}
      height={size}
      onDraw={(ctx) => {
        ctx.fillStyle = `hsl(${getHueFromColor(color)} 100% 50%)`;
        ctx.fillRect(0, 0, size, size);

        const whiteGradient = ctx.createLinearGradient(0, 0, size, 0);

        whiteGradient.addColorStop(0, "rgba(255,255,255,1)");
        whiteGradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0, 0, size, size);

        const blackGradient = ctx.createLinearGradient(0, 0, 0, size);

        blackGradient.addColorStop(0, "rgba(0,0,0,0)");
        blackGradient.addColorStop(1, "rgba(0,0,0,1)");

        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, size, size);
      }}
      onPick={(x, y, ctx) => {
        const [r, g, b] = ctx.getImageData(
          Math.floor(x * size),
          Math.floor(y * size),
          1,
          1
        ).data;

        onChange(changeRGB(color, r / 255, g / 255, b / 255));
      }}
    />
  );
}).withConfig({ displayName: "ColorBlock" })``;

const ColorHue = styled<
  FC<{
    className?: string;
    width: number;
    color: Color;
    onChange(color: Color): void;
  }>
>(({ className, width, color, onChange }) => {
  const height = 12;

  return (
    <Canvas
      className={className}
      width={width}
      height={height}
      onDraw={(ctx) => {
        const rainbow = ctx.createLinearGradient(0, 0, width, 0);

        rainbow.addColorStop(0, "rgba(255, 0, 0, 1)");
        rainbow.addColorStop(0.17, "rgba(255, 255, 0, 1)");
        rainbow.addColorStop(0.34, "rgba(0, 255, 0, 1)");
        rainbow.addColorStop(0.51, "rgba(0, 255, 255, 1)");
        rainbow.addColorStop(0.68, "rgba(0, 0, 255, 1)");
        rainbow.addColorStop(0.85, "rgba(255, 0, 255, 1)");
        rainbow.addColorStop(1, "rgba(255, 0, 0, 1)");

        ctx.fillStyle = rainbow;
        ctx.fillRect(0, 0, width, height);
      }}
      onPick={(x) => {
        onChange(changeHue(color, x * 360));
      }}
    />
  );
}).withConfig({ displayName: "ColorHue" })``;

const ColorOpacity = styled<
  FC<{
    className?: string;
    width: number;
    color: Color;
    onChange(color: Color): void;
  }>
>(({ className, width, color, onChange }) => {
  const height = 12;

  return (
    <Canvas
      className={className}
      width={width}
      height={height}
      onDraw={(ctx) => {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, width, height);

        const chessSize = 3;

        ctx.fillStyle = "#0001";

        for (let x = 0; x <= width / chessSize; x += 1) {
          for (let y = 0; y <= height / chessSize; y += 1) {
            if ((x + y) % 2) {
              ctx.fillRect(x * chessSize, y * chessSize, chessSize, chessSize);
            }
          }
        }

        const opacityGradient = ctx.createLinearGradient(0, 0, width, 0);

        opacityGradient.addColorStop(
          0,
          colorToCssString(changeAlpha(color, 0))
        );
        opacityGradient.addColorStop(
          1,
          colorToCssString(changeAlpha(color, 1))
        );

        ctx.fillStyle = opacityGradient;
        ctx.fillRect(0, 0, width, height);
      }}
      onPick={(x) => {
        onChange(changeAlpha(color, x));
      }}
    />
  );
}).withConfig({ displayName: "ColorOpacity" })``;

export const ColorPicker = styled<
  FC<{ className?: string; onChange(color: string): void }>
>(({ className, onChange }) => {
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const [newColor, setNewColor] = useState<Color>(() => ({
    rgba: { r: 0.5, g: 0.4, b: 0.1, a: 1 },
  }));

  useEffect(() => {
    onChangeRef.current(colorToCssString(newColor));
  }, [newColor]);

  return (
    <div className={className}>
      <div>
        <ColorBlock size={240} color={newColor} onChange={setNewColor} />
      </div>
      <div>
        <ColorHue width={240} color={newColor} onChange={setNewColor} />
      </div>
      <div>
        <ColorOpacity width={240} color={newColor} onChange={setNewColor} />
      </div>
      <div>{colorToCssString(newColor)}</div>
    </div>
  );
}).withConfig({ displayName: "ColorPicker" })``;