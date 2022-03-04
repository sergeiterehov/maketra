import { observer } from "mobx-react-lite";
import { CustomInput } from "./components/CustomInput";
import { ElementsRow } from "./components/ElementsRow";
import { Icon } from "./components/Icon";
import { Scrubber } from "./components/Scrubber";
import { Option, Select } from "./components/Select";
import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { Constraint, MkNode } from "./models/MkNode";
import { FontStyle, FontWeight, Text, TextAlign } from "./models/Text";

function formatTextAlign(value: TextAlign): string {
  switch (value) {
    case TextAlign.Left:
      return "Left align";
    case TextAlign.Right:
      return "Right align";
    case TextAlign.Center:
      return "Center align";
  }
}

function formatFontWeight(value: FontWeight): string {
  switch (value) {
    case FontWeight.Thin:
      return "Thin (Hairline)";
    case FontWeight.ExtraLight:
      return "Extra Light (Ultra Light)";
    case FontWeight.Light:
      return "Light";
    case FontWeight.Normal:
      return "Normal (Regular)";
    case FontWeight.Medium:
      return "Medium";
    case FontWeight.SemiBold:
      return "Semi Bold (Demi Bold)";
    case FontWeight.Bold:
      return "Bold";
    case FontWeight.ExtraBold:
      return "Extra Bold (Ultra Bold)";
    case FontWeight.Black:
      return "Black (Heavy)";
  }
}

export const NodeProps = observer<{ node: MkNode }>(({ node }) => {
  return (
    <>
      <div>
        Name:
        <input
          value={node.name}
          onChange={(e) => (node.name = e.currentTarget.value)}
        />
      </div>
      <ElementsRow>
        <Scrubber value={node.x} onChange={(next) => (node.x = next || 0)}>
          <Icon>X</Icon>
          <CustomInput
            value={node.x.toString()}
            onChange={(next) => {
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.x = value;

              return true;
            }}
          />
        </Scrubber>
        <Scrubber
          className="second-in-row"
          value={node.y}
          onChange={(next) => (node.y = next || 0)}
        >
          <Icon>Y</Icon>
          <CustomInput
            value={node.y.toString()}
            onChange={(next) => {
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.y = value;

              return true;
            }}
          />
        </Scrubber>
      </ElementsRow>
      <ElementsRow>
        <Scrubber value={node.width} onChange={(next) => (node.width = next)}>
          <Icon>W</Icon>
          <CustomInput
            value={node.width?.toString()}
            onChange={(next) => {
              if (!next) {
                node.width = undefined;

                return true;
              }
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.width = value;

              return true;
            }}
          />
        </Scrubber>
        <Scrubber
          className="second-in-row"
          value={node.height}
          onChange={(next) => (node.height = next)}
        >
          <Icon>H</Icon>
          <CustomInput
            value={node.height?.toString()}
            onChange={(next) => {
              if (!next) {
                node.height = undefined;

                return true;
              }
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.height = value;

              return true;
            }}
          />
        </Scrubber>
      </ElementsRow>
      <ElementsRow>
        <Scrubber
          value={node.rotate}
          onChange={(next) => (node.rotate = next || 0)}
        >
          <Icon>A</Icon>
          <CustomInput
            value={node.rotate.toString()}
            onChange={(next) => {
              const value = Number(next);

              if (Number.isNaN(value)) return false;

              node.rotate = value;

              return true;
            }}
          />
        </Scrubber>
      </ElementsRow>
      {node instanceof Area ? (
        <div>
          <label>
            <input
              type="checkbox"
              checked={node.clipContent}
              onChange={(e) => (node.clipContent = e.currentTarget.checked)}
            />
            Clip content
          </label>
        </div>
      ) : null}
      {node.parentNode ? (
        <>
          <div>
            H Constraint
            <select
              value={node.horizontalConstraint}
              onChange={(e) =>
                (node.horizontalConstraint = Number(e.currentTarget.value))
              }
            >
              <option value={Constraint.Left}>Left</option>
              <option value={Constraint.Center}>Center</option>
              <option value={Constraint.Right}>Right</option>
              <option value={Constraint.Scale}>SCALE</option>
            </select>
          </div>
          <div>
            V Constraint
            <select
              value={node.verticalConstraint}
              onChange={(e) =>
                (node.verticalConstraint = Number(e.currentTarget.value))
              }
            >
              <option value={Constraint.Top}>Top</option>
              <option value={Constraint.Center}>Center</option>
              <option value={Constraint.Bottom}>Bottom</option>
              <option value={Constraint.Scale}>SCALE</option>
            </select>
          </div>
        </>
      ) : null}
      {node instanceof Area || node instanceof Figure ? (
        <div>
          Background color:
          <input
            value={node.backgroundColor}
            onChange={(e) => (node.backgroundColor = e.currentTarget.value)}
          />
        </div>
      ) : null}
      {node instanceof Figure ? (
        <>
          <Scrubber
            speed={0.02}
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
          </ElementsRow>
          <div>
            FontSize:
            <input
              type="number"
              step={1}
              value={node.fontSize}
              onChange={(e) =>
                (node.fontSize = Number(e.currentTarget.value) || 0)
              }
            />
          </div>
          <div>
            Font family:
            <input
              value={node.fontFamily}
              onChange={(e) => (node.fontFamily = e.currentTarget.value)}
            />
          </div>
          <div>
            Font weight:
            <Select
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
          </div>
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
          <div>
            Color:
            <input
              value={node.textColor}
              onChange={(e) => (node.textColor = e.currentTarget.value)}
            />
          </div>
        </>
      ) : null}
    </>
  );
});
