import { observer } from "mobx-react-lite";
import { CustomInput } from "./components/CustomInput";
import { ElementsRow } from "./components/ElementsRow";
import { Icon } from "./components/Icon";
import { Label } from "./components/Label";
import { Scrubber } from "./components/Scrubber";
import { Option, Select } from "./components/Select";
import { PropSizeInput } from "./components/PropSizeInput";
import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { Constraint, MkNode } from "./models/MkNode";
import { FontStyle, FontWeight, Text, TextAlign } from "./models/Text";
import { PropLocationInput } from "./components/PropLocationInput";
import { BlendMode } from "./models/Fill";
import { Primitive } from "./models/Primitive";

function formatTextAlign(value: TextAlign): string {
  switch (value) {
    case TextAlign.Left:
      return "Слева";
    case TextAlign.Right:
      return "Справа";
    case TextAlign.Center:
      return "По-центру";
  }
}

function formatFontWeight(value: FontWeight): string {
  switch (value) {
    case FontWeight.Thin:
      return "Самый легкий";
    case FontWeight.ExtraLight:
      return "Очень легкий";
    case FontWeight.Light:
      return "Легкий";
    case FontWeight.Normal:
      return "Обычный";
    case FontWeight.Medium:
      return "Средний";
    case FontWeight.SemiBold:
      return "Полужирный";
    case FontWeight.Bold:
      return "Жирный";
    case FontWeight.ExtraBold:
      return "Очень жирный";
    case FontWeight.Black:
      return "Самый жирный";
  }
}

function formatVerticalConstraint(value: Constraint): string {
  switch (value) {
    case Constraint.Top:
      return "Сверху";
    case Constraint.Bottom:
      return "Снизу";
    case Constraint.Center:
      return "Вертикально";
    case Constraint.Scale:
      return "Увеличивать";
  }
}

function formatHorizontalConstraint(value: Constraint): string {
  switch (value) {
    case Constraint.Left:
      return "Слева";
    case Constraint.Right:
      return "Справа";
    case Constraint.Center:
      return "Горизонтально";
    case Constraint.Scale:
      return "Расширять";
  }
}

function formatBlendMode(value: BlendMode): string {
  switch (value) {
    case BlendMode.Normal:
      return "Нормальный";
    case BlendMode.Lighten:
      return "Замена светлым";
    case BlendMode.Screen:
      return "Экран";
    case BlendMode.ColorDodge:
      return "Осветление основы";
    case BlendMode.Darken:
      return "Затемнение";
    case BlendMode.Multiply:
      return "Умножение";
    case BlendMode.ColorBurn:
      return "Затемнение основы";
    case BlendMode.Overlay:
      return "Перекрытие";
    case BlendMode.SoftLight:
      return "Мягкий свет";
    case BlendMode.HardLight:
      return "Жесткий свет";
    case BlendMode.Difference:
      return "Разница";
    case BlendMode.Exclusion:
      return "Исключение";
    case BlendMode.Hue:
      return "Тон";
    case BlendMode.Saturation:
      return "Насыщенность";
    case BlendMode.Color:
      return "Цветность";
    case BlendMode.Luminosity:
      return "Яркость";
    default:
      return value;
  }
}

export const NodeProps = observer<{ node: MkNode }>(({ node }) => {
  return (
    <>
      <ElementsRow>
        <PropLocationInput node={node} property="x" />
        <PropLocationInput className="second-in-row" node={node} property="y" />
      </ElementsRow>
      <ElementsRow>
        <PropSizeInput property="width" node={node} />
        <PropSizeInput
          className="second-in-row"
          property="height"
          node={node}
        />
      </ElementsRow>
      <ElementsRow>
        <Scrubber
          value={(node.rotate / Math.PI) * 180}
          onChange={(next) => (node.rotate = ((next || 0) / 180) * Math.PI)}
        >
          <Icon>&#8635;</Icon>
          <CustomInput
            value={((node.rotate / Math.PI) * 180).toString()}
            onChange={(next) => {
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.rotate = (value / 180) * Math.PI;

              return true;
            }}
          />
        </Scrubber>
        {node instanceof Primitive ? (
          <Scrubber
            className="second-in-row"
            min={0}
            value={node.cornerRadius}
            onChange={(next) => (node.cornerRadius = next || 0)}
          >
            <Icon>&#8978;</Icon>
            <CustomInput
              value={node.cornerRadius.toString()}
              onChange={(next) => {
                const value = Number(next);

                if (Number.isNaN(value)) return false;

                node.cornerRadius = Math.max(0, value);

                return true;
              }}
            />
          </Scrubber>
        ) : null}
      </ElementsRow>
      {node instanceof Area ? (
        <ElementsRow>
          <Label className="clip-content">
            <input
              type="checkbox"
              checked={node.clipContent}
              onChange={(e) => (node.clipContent = e.currentTarget.checked)}
            />
            Обрезать контент
          </Label>
        </ElementsRow>
      ) : null}
      {node.parentNode ? (
        <>
          <ElementsRow>
            <Select
              className="horizontal-constraint"
              value={node.horizontalConstraint}
              onChange={(next) => (node.horizontalConstraint = next)}
              format={formatHorizontalConstraint}
            >
              <Option value={Constraint.Left} />
              <Option value={Constraint.Center} />
              <Option value={Constraint.Right} />
              <Option value={Constraint.Scale} />
            </Select>
            <Select
              className="vertical-constraint"
              value={node.verticalConstraint}
              onChange={(next) => (node.verticalConstraint = next)}
              format={formatVerticalConstraint}
            >
              <Option value={Constraint.Top} />
              <Option value={Constraint.Center} />
              <Option value={Constraint.Bottom} />
              <Option value={Constraint.Scale} />
            </Select>
          </ElementsRow>
        </>
      ) : null}
      <ElementsRow>
        <Select
          className="blend-mode"
          value={node.blendMode}
          onChange={(next) => (node.blendMode = next)}
          format={formatBlendMode}
        >
          <Option value={BlendMode.Normal} />
          <hr />
          <Option value={BlendMode.Lighten} />
          <Option value={BlendMode.Screen} />
          <Option value={BlendMode.ColorDodge} />
          <hr />
          <Option value={BlendMode.Darken} />
          <Option value={BlendMode.Multiply} />
          <Option value={BlendMode.ColorBurn} />
          <hr />
          <Option value={BlendMode.Overlay} />
          <Option value={BlendMode.SoftLight} />
          <Option value={BlendMode.HardLight} />
          <hr />
          <Option value={BlendMode.Difference} />
          <Option value={BlendMode.Exclusion} />
          <hr />
          <Option value={BlendMode.Hue} />
          <Option value={BlendMode.Saturation} />
          <Option value={BlendMode.Color} />
          <Option value={BlendMode.Luminosity} />
        </Select>
        <Scrubber
          className="opacity"
          speed={0.01}
          min={0}
          max={1}
          value={node.opacity}
          onChange={(next) => (node.opacity = next || 0)}
        >
          <Icon>В</Icon>
          <CustomInput
            value={node.opacity.toString()}
            onChange={(next) => {
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.opacity = Math.min(1, Math.max(0, value));

              return true;
            }}
          />
        </Scrubber>
      </ElementsRow>
      {node instanceof Figure ? (
        <>
          <Scrubber
            speed={0.02}
            min={0}
            value={node.strokeWidth}
            onChange={(next) => (node.strokeWidth = next || 0)}
          >
            <Icon>sw</Icon>
            <CustomInput
              value={node.strokeWidth?.toString()}
              onChange={(next) => {
                const value = Number(next);

                if (Number.isNaN(value)) return false;

                node.strokeWidth = value;

                return true;
              }}
            />
          </Scrubber>
          <div>
            Stroke color:
            <input
              value={node.strokeColor}
              onChange={(e) => (node.strokeColor = e.currentTarget.value)}
            />
          </div>
        </>
      ) : null}
      {node instanceof Text ? (
        <>
          <div>
            Text:
            <textarea
              value={node.text}
              onChange={(e) => (node.text = e.currentTarget.value)}
            />
          </div>
          <ElementsRow>
            <Select
              className="text-align"
              value={node.textAlign}
              onChange={(next) => (node.textAlign = next)}
              format={formatTextAlign}
            >
              <Option value={TextAlign.Left} />
              <Option value={TextAlign.Center} />
              <Option value={TextAlign.Right} />
            </Select>
            <Scrubber
              className="font-size"
              speed={1}
              value={node.fontSize}
              onChange={(next) => (node.fontSize = next || 0)}
            >
              <Icon>aA</Icon>
              <CustomInput
                value={node.fontSize?.toString()}
                onChange={(next) => {
                  const value = Number(next);

                  if (Number.isNaN(value)) return false;

                  node.fontSize = value;

                  return true;
                }}
              />
            </Scrubber>
          </ElementsRow>
          <div>
            Font family:
            <input
              value={node.fontFamily}
              onChange={(e) => (node.fontFamily = e.currentTarget.value)}
            />
          </div>
          <ElementsRow>
            <Select
              className="font-weight"
              value={node.fontWeight}
              onChange={(next) => (node.fontWeight = next)}
              format={formatFontWeight}
            >
              <Option value={FontWeight.Thin} />
              <Option value={FontWeight.ExtraLight} />
              <Option value={FontWeight.Light} />
              <Option value={FontWeight.Normal} />
              <Option value={FontWeight.Medium} />
              <Option value={FontWeight.SemiBold} />
              <Option value={FontWeight.Bold} />
              <Option value={FontWeight.ExtraBold} />
              <Option value={FontWeight.Black} />
            </Select>
          </ElementsRow>
          <div>
            <label>
              <input
                type="checkbox"
                checked={node.fontStyle === FontStyle.Italic}
                onChange={(e) =>
                  (node.fontStyle = e.currentTarget.checked
                    ? FontStyle.Italic
                    : FontStyle.Normal)
                }
              />
              Italic
            </label>
          </div>
        </>
      ) : null}
    </>
  );
});
