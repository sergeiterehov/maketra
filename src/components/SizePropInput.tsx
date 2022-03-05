import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import styled from "styled-components";
import { MkNode } from "../models/MkNode";
import { CustomInput } from "./CustomInput";
import { Icon } from "./Icon";
import { Scrubber } from "./Scrubber";

export const SizePropInput = styled<
  FC<{
    className?: string;
    node: MkNode;
    property: "width" | "height";
  }>
>(
  observer(({ className, node, property }) => {
    const locationProperty = property === "width" ? "x" : "y";

    const onScrubHandler = useCallback(
      (next: number) =>
        runInAction(() => {
          node[property] = next;
        }),
      [node, property]
    );

    const inputChangeHandler = useCallback(
      (next) => {
        if (!next) {
          runInAction(() => (node[property] = undefined));

          return true;
        }

        if (next === "край") {
          runInAction(() => {
            if (node.parentNode) {
              node[property] =
                node.parentNode.size[property] - node[locationProperty];
            }
          });

          return true;
        }

        let units = "";

        if (next[next.length - 1] === "%") {
          units = "%";
          next = next.slice(0, -1);
        }

        const num = Number(next);

        if (Number.isNaN(num)) return false;

        let value: number = num;

        if (units === "%" && node.parentNode) {
          value = (node.parentNode.size[property] * num) / 100;
        }

        // Если указан знак, то будет добавляться или вычитаться.
        if ((next[0] === "+" || next[0] === "-") && node[property]) {
          value = node[property]! + value;
        }

        runInAction(() => (node[property] = value));

        return true;
      },
      [locationProperty, node, property]
    );

    return (
      <Scrubber
        className={className}
        value={node[property]}
        onChange={onScrubHandler}
      >
        {property === "width" ? <Icon>&#8660;</Icon> : <Icon>&#8661;</Icon>}
        <CustomInput
          value={node[property]?.toString()}
          onChange={inputChangeHandler}
        />
      </Scrubber>
    );
  })
)``;
