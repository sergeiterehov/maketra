import { FC, useCallback, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { Color } from "../utils/Color";

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

          const x = Math.min(width, Math.max(0, e.clientX - left)) / width;
          const y = Math.min(height, Math.max(0, e.clientY - top)) / height;

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

const Saturation = styled<
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
        ctx.fillStyle = `hsl(${color.hsl_h} 100% 50%)`;
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

        const x = color.hsv_s * size;
        const y = (1 - color.hsv_v) * size;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color.hex_string;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 8, Math.PI, Math.PI * 2);
        ctx.strokeStyle = "white";
        ctx.stroke();
      }}
      onPick={(x, y) => {
        const next = color.copy();

        next.hsv_s = x;
        next.hsv_v = 1 - y;

        onChange(next);
      }}
    />
  );
}).withConfig({ displayName: "ColorBlock" })``;

const Hue = styled<
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

        const x = (color.hsl_h / 360) * width;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(x - 4, -4, 8, height + 8);
        ctx.stroke();
      }}
      onPick={(x) => {
        const next = color.copy();

        next.hsl_h = x * 360;

        onChange(next);
      }}
    />
  );
}).withConfig({ displayName: "ColorHue" })``;

const Opacity = styled<
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

        ctx.fillStyle = "#DDD";

        for (let x = 0; x <= width / chessSize; x += 1) {
          for (let y = 0; y <= height / chessSize; y += 1) {
            if ((x + y) % 2) {
              ctx.fillRect(x * chessSize, y * chessSize, chessSize, chessSize);
            }
          }
        }

        const opacityGradient = ctx.createLinearGradient(0, 0, width, 0);

        opacityGradient.addColorStop(0, color.hex_string_no_alpha + "00");
        opacityGradient.addColorStop(1, color.hex_string_no_alpha + "FF");

        ctx.fillStyle = opacityGradient;
        ctx.fillRect(0, 0, width, height);

        const x = color.a * width;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(x - 4, -4, 8, height + 8);
        ctx.stroke();
      }}
      onPick={(x) => {
        const next = color.copy();

        next.a = x;

        onChange(next);
      }}
    />
  );
}).withConfig({ displayName: "ColorOpacity" })``;

export const ColorController = styled<
  FC<{ className?: string; color: Color; onChange(color: Color): void }>
>(({ className, color, onChange }) => {
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const changeColorHandler = useCallback((newColor) => {
    onChangeRef.current(newColor);
  }, []);

  return (
    <div className={className}>
      <div className="color-controller-saturation">
        <Saturation size={240} color={color} onChange={changeColorHandler} />
      </div>
      <div>
        <Hue width={240} color={color} onChange={changeColorHandler} />
      </div>
      <div>
        <Opacity width={240} color={color} onChange={changeColorHandler} />
      </div>
      <div className="color-controller-names">
        <div>{color.rgba_string}</div>
        <div>{color.hsla_string}</div>
        <div>{color.hex_string}</div>
      </div>
    </div>
  );
}).withConfig({ displayName: "ColorController" })`
  .color-controller-names {
    padding: 4px 8px;

    & > div {
      padding: 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;
