import { FC, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export const StyledInput = styled.input.withConfig({
  displayName: "custom-input",
})`
  cursor: default;
  display: block;
  width: 100%;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: 1em;
  border: 0;
  height: 28px;
  border: solid 1px transparent;
  box-sizing: border-box;
`;

export const CustomInput: FC<{
  className?: string;
  value?: string;
  onChange?(newValue?: string): boolean;
}> = ({ className, value, onChange }) => {
  const skipBlurRef = useRef(false);
  const valueRef = useRef(value);

  valueRef.current = value;

  const [text, setText] = useState(value || "");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const onChangeApply = useCallback(
    (newValue?: string): boolean => {
      const applied = onChange ? onChange(newValue) : false;

      if (applied) {
        // ok
      } else {
        setText(valueRef.current || "");
      }

      return applied;
    },
    [onChange]
  );

  const onChangeReset = useCallback(() => {
    setText(valueRef.current || "");
  }, []);

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setText(e.currentTarget.value);
    },
    []
  );

  const blurHandler: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (skipBlurRef.current) return;

      onChangeApply(e.currentTarget.value);
    },
    [onChangeApply]
  );

  const keyDownHandler: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        switch (e.key) {
          default:
            return;
          case "Enter":
            onChangeApply(e.currentTarget.value);
            break;
          case "Escape":
            skipBlurRef.current = true;
            onChangeReset();
            e.currentTarget.blur();
            skipBlurRef.current = false;
            break;
        }

        e.preventDefault();
        e.stopPropagation();
      },
      [onChangeApply, onChangeReset]
    );

  const mouseDownHandler: React.MouseEventHandler<HTMLInputElement> =
    useCallback((e) => {
      e.stopPropagation();
    }, []);

  const mouseUpHandler: React.MouseEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const { selectionStart, selectionEnd } = e.currentTarget;

      if (selectionStart === selectionEnd) {
        e.currentTarget.select();
      }
    },
    []
  );

  return (
    <StyledInput
      className={className}
      type="text"
      autoComplete="off"
      dir="auto"
      spellCheck="false"
      placeholder="-"
      value={text}
      onChange={changeHandler}
      onKeyDown={keyDownHandler}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onBlur={blurHandler}
    />
  );
};
