import { FC, useCallback, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

export const RowSpanInput = styled<
  FC<{
    className?: string;
    value: string;
    onChange(value: string): void;
  }>
>(({ className, value, onChange }) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const [isNameEditing, setIsNameEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useLayoutEffect(() => {
    if (isNameEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
      nameInputRef.current.scrollLeft = 0;
    }
  }, [isNameEditing]);

  const newNameChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setNewName(e.currentTarget.value);
    }, []);

  const nameDoubleClickHandler: React.MouseEventHandler<HTMLSpanElement> =
    useCallback(() => {
      setNewName(valueRef.current);
      setIsNameEditing(true);
    }, []);

  const newNameKeyDownHandler: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback((e) => {
      switch (e.code) {
        case "Enter":
          const next = e.currentTarget.value;

          onChangeRef.current(next);
          setIsNameEditing(false);
          break;
        case "Escape":
          setIsNameEditing(false);
          break;
      }
    }, []);

  const newNameBlurHandler: React.FocusEventHandler<HTMLInputElement> =
    useCallback(() => {
      setIsNameEditing(false);
    }, []);

  return isNameEditing ? (
    <input
      ref={nameInputRef}
      className={className}
      value={newName}
      onChange={newNameChangeHandler}
      onKeyDown={newNameKeyDownHandler}
      onBlur={newNameBlurHandler}
    />
  ) : (
    <span className={className} onDoubleClick={nameDoubleClickHandler}>
      {value}
    </span>
  );
}).withConfig({ displayName: "RowSpanInput" })`
  line-height: 32px;
  height: 32px;
  padding: 0 8px;
  width: calc(100% - 16px);
  flex-shrink: 1;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;

  &:is(input) {
    border: solid 2px var(--color-focus);
    padding: 0 6px;
    margin: 4px 0;
    margin-right: 8px;
    width: calc(100% - 20px);
    height: 24px;
    border-radius: var(--radius-ui);
    line-height: 1em;
    font-family: inherit;
    font-size: inherit;
    box-sizing: border-box;
  }
`;
