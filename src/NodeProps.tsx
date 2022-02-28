import { observer } from "mobx-react-lite";
import { Area, Figure, MkNode } from "./models";

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
    </>
  );
});
