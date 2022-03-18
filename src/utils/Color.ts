function norm(value: number, scale: number, precision: number = 1): number {
  const dec = 10 ** (precision - 1);

  return Math.round(value * dec * scale) / dec;
}

/**
 * @author Sergey Terekhov
 */
export class Color {
  private _a: number = 1;

  private _rgb_r: number = 1;
  private _rgb_g: number = 0;
  private _rgb_b: number = 0;

  private _hsl_h: number = 0;
  private _hsl_s: number = 1;
  private _hsl_l: number = 0.5;

  private _hsv_h: number = 0;
  private _hsv_s: number = 1;
  private _hsv_v: number = 1;

  constructor(props?: { rgb?: number[] }) {
    if (props) {
      if (props.rgb) this.rgb = props.rgb;
    }
  }

  copy() {
    const copy = new Color();

    copy._a = this._a;
    copy._rgb_r = this._rgb_r;
    copy._rgb_g = this._rgb_g;
    copy._rgb_b = this._rgb_b;
    copy._hsl_h = this._hsl_h;
    copy._hsl_s = this._hsl_s;
    copy._hsl_l = this._hsl_l;
    copy._hsv_h = this._hsv_h;
    copy._hsv_s = this._hsv_s;
    copy._hsv_v = this._hsv_v;

    return copy;
  }

  get a(): number {
    return this._a;
  }

  get rgb_r(): number {
    return this._rgb_r;
  }
  get rgb_g(): number {
    return this._rgb_g;
  }
  get rgb_b(): number {
    return this._rgb_b;
  }

  get rgb(): number[] {
    return [this._rgb_r, this._rgb_g, this._rgb_b];
  }
  get rgb_string(): string {
    const { _rgb_r, _rgb_g, _rgb_b } = this;

    return `rgb(${norm(_rgb_r, 255)}, ${norm(_rgb_g, 255)}, ${norm(
      _rgb_b,
      255
    )})`;
  }
  get rgba_string(): string {
    const { _rgb_r, _rgb_g, _rgb_b, _a } = this;

    return `rgba(${norm(_rgb_r, 255)}, ${norm(_rgb_g, 255)}, ${norm(
      _rgb_b,
      255
    )}, ${norm(_a, 1, 3)})`;
  }

  get hsl_h(): number {
    return this._hsl_h;
  }
  get hsl_s(): number {
    return this._hsl_s;
  }
  get hsl_l(): number {
    return this._hsl_l;
  }

  get hsl(): number[] {
    return [this._hsl_h, this._hsl_s, this._hsl_l];
  }
  get hsl_string(): string {
    const { _hsl_h, _hsl_s, _hsl_l } = this;

    return `hsl(${_hsl_h}, ${norm(_hsl_s, 100, 2)}%, ${norm(_hsl_l, 1, 3)}%)`;
  }
  get hsla_string(): string {
    const { _hsl_h, _hsl_s, _hsl_l, _a } = this;

    return `hsla(${_hsl_h}, ${norm(_hsl_s, 100, 2)}%, ${norm(
      _hsl_l,
      1,
      3
    )}%, ${norm(_a, 100, 2)})`;
  }

  get hsv_h(): number {
    return this._hsv_h;
  }
  get hsv_s(): number {
    return this._hsv_s;
  }
  get hsv_v(): number {
    return this._hsv_v;
  }

  get hsv(): number[] {
    return [this._hsv_h, this._hsv_s, this._hsv_v];
  }

  get hex_string(): string {
    const { _rgb_r, _rgb_g, _rgb_b, _a } = this;

    const r = Math.floor(_rgb_r * 255);
    const g = Math.floor(_rgb_g * 255);
    const b = Math.floor(_rgb_b * 255);
    const a = Math.floor(_a * 255);

    return `#${(
      (BigInt(1) << BigInt(32)) +
      (BigInt(r) << BigInt(24)) +
      BigInt(g << 16) +
      BigInt(b << 8) +
      BigInt(a)
    )
      .toString(16)
      .slice(1)}`;
  }
  get hex_string_no_alpha(): string {
    const { _rgb_r, _rgb_g, _rgb_b } = this;

    const r = Math.floor(_rgb_r * 255);
    const g = Math.floor(_rgb_g * 255);
    const b = Math.floor(_rgb_b * 255);

    return `#${(
      (BigInt(1) << BigInt(24)) +
      (BigInt(r) << BigInt(16)) +
      BigInt(g << 8) +
      BigInt(b)
    )
      .toString(16)
      .slice(1)}`;
  }

  set a(a: number) {
    this._a = a;
  }

  set rgb_r(r: number) {
    this._rgb_r = r;
    this.apply_from_rgb();
  }
  set rgb_g(g: number) {
    this._rgb_g = g;
    this.apply_from_rgb();
  }
  set rgb_b(b: number) {
    this._rgb_b = b;
    this.apply_from_rgb();
  }

  set rgb([r, g, b]: number[]) {
    this._rgb_r = r;
    this._rgb_g = g;
    this._rgb_b = b;
    this.apply_from_rgb();
  }
  set rgb_255([r, g, b]: number[] | Uint8ClampedArray) {
    this._rgb_r = r / 255;
    this._rgb_g = g / 255;
    this._rgb_b = b / 255;
    this.apply_from_rgb();
  }

  set hsl_h(h: number) {
    this._hsl_h = h;
    this.apply_from_hsl();
  }
  set hsl_s(s: number) {
    this._hsl_s = s;
    this.apply_from_hsl();
  }
  set hsl_l(l: number) {
    this._hsl_l = l;
    this.apply_from_hsl();
  }

  set hsl([h, s, l]: number[]) {
    this._hsl_h = h;
    this._hsl_s = s;
    this._hsl_l = l;
    this.apply_from_hsl();
  }

  set hsv_h(h: number) {
    this._hsv_h = h;
    this.apply_from_hsv();
  }
  set hsv_s(s: number) {
    this._hsv_s = s;
    this.apply_from_hsv();
  }
  set hsv_v(v: number) {
    this._hsv_v = v;
    this.apply_from_hsv();
  }

  set hsv([h, s, v]: number[]) {
    this._hsv_h = h;
    this._hsv_s = s;
    this._hsv_v = v;
    this.apply_from_hsv();
  }

  private apply_from_rgb() {
    const { _rgb_r: r, _rgb_b: b, _rgb_g: g } = this;

    const cMax = Math.max(r, g, b);
    const cMin = Math.min(r, g, b);
    const delta = cMax - cMin;

    let h = 0;
    let l = (cMax + cMin) / 2;
    let sl_s = delta / (1 - Math.abs(2 * l - 1));
    let sv_s = delta / cMax;
    let v = cMax;

    if (delta === 0) {
      h = 0;
    } else if (cMax === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (cMax === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    h = Math.round(h);

    console.log(this._hsl_h, h);

    this._hsl_h = h;
    this._hsl_s = sl_s;
    this._hsl_l = l;

    this._hsv_h = h;
    this._hsv_s = sv_s;
    this._hsv_v = v;
  }

  private apply_to_rgb() {
    const { _hsl_h: h, _hsl_s: s, _hsl_l: l } = this;

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

    this._rgb_r = r < 0 ? 0 : r + m;
    this._rgb_g = g < 0 ? 0 : g + m;
    this._rgb_b = b < 0 ? 0 : b + m;
  }

  private apply_from_hsl() {
    const { _hsl_h: h, _hsl_s: s, _hsl_l: l } = this;

    const v = s * Math.min(l, 1 - l) + l;

    this._hsv_h = h;
    this._hsv_v = v;
    this._hsv_s = v ? 2 - (2 * l) / v : 0;

    this.apply_to_rgb();
  }

  private apply_from_hsv() {
    const { _hsv_h: h, _hsv_s: s, _hsv_v: v } = this;

    const l = v - (v * s) / 2;
    const m = Math.min(l, 1 - l);

    this._hsl_h = h;
    this._hsl_l = l;
    this._hsl_s = m ? (v - l) / m : 0;

    this.apply_to_rgb();
  }
}
