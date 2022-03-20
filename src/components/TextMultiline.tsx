import { FC, useCallback, useRef } from "react";
import styled from "styled-components";

export const TextMultiline = styled<
  FC<{
    className?: string;
    value: string;
    onChange(value: string): void;
  }>
>(({ className, value, onChange }) => {
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const changeHandler: React.ChangeEventHandler<HTMLTextAreaElement> =
    useCallback((e) => {
      onChangeRef.current(e.currentTarget.value);
    }, []);

  return (
    <textarea className={className} value={value} onChange={changeHandler} />
  );
})`
  cursor: default;
  display: block;
  width: 100%;
  color: currentColor;
  padding: 4px 7px;
  font-family: inherit;
  font-size: inherit;
  resize: none;
  line-height: 1em;
  border: 0;
  border: solid 1px transparent;
  box-sizing: border-box;
`;
