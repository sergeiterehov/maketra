import { observer } from "mobx-react-lite";
import { Area, Figure, MkNode, Text } from "./models";

const numPropToChangingStep: Record<string, number> = {
  x: 10,
  y: 10,
  width: 10,
  height: 10,
  scaleX: 0.1,
  scaleY: 0.1,
  rotate: Math.PI / 180,
};

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
      {(
        ["x", "y", "width", "height", "rotate", "scaleX", "scaleY"] as Array<
          keyof MkNode
        >
      ).map((key) => {
        if (!node.hasOwnProperty(key)) return null;

        return (
          <div>
            {key}=
            <input
              key={key}
              type="number"
              step={numPropToChangingStep[key] || 1}
              value={String(node[key])}
              onChange={(e) =>
                ((node[key] as any) = Number(e.currentTarget.value) || 0)
              }
            />
          </div>
        );
      })}
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
            FontSize:
            <input
              type="number"
              step={1}
              value={node.fontSize}
              onChange={(e) => (node.fontSize = Number(e.currentTarget.value) || 0)}
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
            <input
              value={node.fontWeight}
              onChange={(e) => (node.fontWeight = e.currentTarget.value)}
            />
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