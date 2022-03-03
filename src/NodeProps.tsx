import { observer } from "mobx-react-lite";
import { CustomInput } from "./components/CustomInput";
import { ElementsRow } from "./components/ElementsRow";
import { Icon } from "./components/Icon";
import { Scrubber } from "./components/Scrubber";
import { Area } from "./models/Area";
import { Figure } from "./models/Figure";
import { Constraint, MkNode } from "./models/MkNode";
import { FontStyle, FontWeight, Text, TextAlign } from "./models/Text";

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
        <div>
          Background color:
          <input
            value={node.strokeColor}
            onChange={(e) => (node.strokeColor = e.currentTarget.value)}
          />
        </div>
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
          <div>
            Align text:
            <select
              value={node.textAlign}
              onChange={(e) =>
                (node.textAlign = e.currentTarget.value as TextAlign)
              }
            >
              <option value={TextAlign.Left}>Left</option>
              <option value={TextAlign.Center}>Center</option>
              <option value={TextAlign.Right}>Right</option>
            </select>
          </div>
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
            <select
              value={node.fontWeight}
              onChange={(e) =>
                (node.fontWeight = e.currentTarget.value as FontWeight)
              }
            >
              <option value="100">Thin (Hairline)</option>
              <option value="200">Extra Light (Ultra Light)</option>
              <option value="300">Light</option>
              <option value="normal">Normal (Regular)</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold (Demi Bold)</option>
              <option value="bold">Bold</option>
              <option value="800">Extra Bold (Ultra Bold)</option>
              <option value="900">Black (Heavy)</option>
            </select>
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
