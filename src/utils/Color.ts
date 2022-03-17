export type ColorRGBA = { r: number; g: number; b: number; a: number };
export type ColorHSLA = { h: number; l: number; s: number; a: number };
export type Color = {
  rgba?: ColorRGBA;
  hsla?: ColorHSLA;
};

export function getHueFromColor(color: Color): number {
  if (color.rgba) {
    const { r, g, b } = color.rgba;

    const R = r;
    const G = g;
    const B = b;

    const min = Math.min(R, G, B);
    const max = Math.max(R, G, B);

    let Hue = 0;

    switch (max) {
      case R:
        Hue = (G - B) / (max - min);
        break;
      case G:
        Hue = 2.0 + (B - R) / (max - min);
        break;
      case B:
        Hue = 4.0 + (R - G) / (max - min);
        break;
    }

    Hue *= 60;

    if (Hue < 0) Hue = Hue + 360;

    return Hue;
  }

  if (color.hsla) {
    return color.hsla.h;
  }

  return 0;
}

export function copyColor(color: Color): Color {
  if (color.rgba) {
    return {
      rgba: {
        r: color.rgba.r,
        g: color.rgba.g,
        b: color.rgba.b,
        a: color.rgba.a,
      },
    };
  }

  if (color.hsla) {
    return {
      hsla: {
        h: color.hsla.h,
        s: color.hsla.s,
        l: color.hsla.l,
        a: color.hsla.a,
      },
    };
  }

  throw new Error("Unknown color type");
}

export function changeRGB(
  color: Color,
  r: number,
  g: number,
  b: number
): Color {
  const next = copyColor(color);

  if (next.rgba) {
    next.rgba.r = r;
    next.rgba.g = g;
    next.rgba.b = b;
  } else if (next.hsla) {
    const { a } = next.hsla;

    delete next.hsla;

    next.rgba = { r, g, b, a };
  }

  return next;
}

export function changeHue(color: Color, hue: number): Color {
  const next = copyColor(color);

  if (next.hsla) {
    next.hsla.h = hue;
  } else if (next.rgba) {
    var hsl = rgbaToHsla(next.rgba);

    hsl.h = hue;

    if (hsl.h > 360) {
      hsl.h -= 360;
    } else if (hsl.h < 0) {
      hsl.h += 360;
    }

    next.rgba = hslaToRgba(hsl);
  }

  return next;
}

export function changeAlpha(color: Color, alpha: number): Color {
  const next = copyColor(color);

  if (next.hsla) {
    next.hsla.a = alpha;
  } else if (next.rgba) {
    next.rgba.a = alpha;
  }

  return next;
}

export function colorToCssString(color: Color): string {
  if (color.rgba) {
    const { r, g, b, a } = color.rgba;

    return `rgba(${norm(r, 255)}, ${norm(g, 255)}, ${norm(b, 255)}, ${norm(
      a,
      1,
      3
    )})`;
  }

  if (color.hsla) {
    const { h, s, l, a } = color.hsla;

    return `hsla(${norm(h, 360)}, ${norm(s, 100, 2)}%, ${norm(
      l,
      1,
      3
    )}%, ${norm(a, 100, 2)})`;
  }

  return "";
}

function norm(value: number, scale: number, precision: number = 1): number {
  const dec = 10 ** (precision - 1);

  return Math.round(value * dec * scale) / dec;
}

function rgbaToHsla({ r, g, b, a }: ColorRGBA): ColorHSLA {
  const cMax = Math.max(r, g, b);
  const cMin = Math.min(r, g, b);
  const delta = cMax - cMin;

  let l = (cMax + cMin) / 2;
  let h = 0;
  let s = 0;

  if (delta === 0) {
    h = 0;
  } else if (cMax === r) {
    h = 60 * (((g - b) / delta) % 6);
  } else if (cMax === g) {
    h = 60 * ((b - r) / delta + 2);
  } else {
    h = 60 * ((r - g) / delta + 4);
  }

  if (delta === 0) {
    s = 0;
  } else {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return { h, s, l, a };
}

function hslaToRgba({ h, s, l, a }: ColorHSLA): ColorRGBA {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r;
  let g;
  let b;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = r < 0 ? 0 : r + m;
  g = g < 0 ? 0 : g + m;
  b = b < 0 ? 0 : b + m;

  return { r, g, b, a };
}

function rgbaToHex({ r, g, b, a }: ColorRGBA) {
  return `#${((1 << 32) + (r << 24) + (g << 16) + (b << 8) + a)
    .toString(16)
    .slice(1)}`;
}
