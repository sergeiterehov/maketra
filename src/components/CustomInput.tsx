import { FC, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const StyledInput = styled.input.withConfig({ displayName: "custom-input" })`
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  border: 0;
  height: 28px;
`;

export const CustomInput: FC<{
  className?: string;
  value?: string;
  onChange?(newValue?: string): boolean;
}> = ({ className, value, onChange }) => {
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
            onChangeReset();
            e.currentTarget.blur();
            break;
        }

        e.preventDefault();
        e.stopPropagation();
      },
      [onChangeApply, onChangeReset]
    );

  return (
    <StyledInput
      className={className}
      type="text"
      autoComplete="off"
      dir="auto"
      value={text}
      onChange={changeHandler}
      onKeyDown={keyDownHandler}
    />
  );
};
