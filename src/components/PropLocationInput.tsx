import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import styled from "styled-components";
import { MkNode } from "../models/MkNode";
import { CustomInput } from "./CustomInput";
import { Icon } from "./Icon";
import { Scrubber } from "./Scrubber";

export const PropLocationInput = styled<
  FC<{ className?: string; node: MkNode; property: "x" | "y" }>
>(
  observer(({ className, node, property }) => {
    const scrubHandler = useCallback(
      (next) => runInAction(() => (node[property] = next || 0)),
      [node, property]
    );

    const inputChangeHandler = useCallback(
      (next) => {
        const value = Number(next);

        if (Number.isNaN(value)) return false;

        runInAction(() => (node[property] = value));

        return true;
      },
      [node, property]
    );

    return (
      <Scrubber
        className={className}
        value={node[property]}
        onChange={scrubHandler}
      >
        {property === "x" ? <Icon>&#8614;</Icon> : <Icon>&#8615;</Icon>}
        <CustomInput
          value={node[property].toString()}
          onChange={inputChangeHandler}
        />
      </Scrubber>
    );
  })
).withConfig({ displayName: "prop-location-input" })``;
