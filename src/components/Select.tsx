import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

export const SelectContext = createContext<{
  value?: any;
  onChange(newValue?: any): void;
  format(value: any): ReactNode;
}>({ onChange() {}, format: () => null });

const OptionContainer = styled.div.withConfig({
  displayName: "option-container",
})`
  display: flex;
  align-items: center;
  padding-left: 8px;
  padding-right: 8px;
  height: 30px;

  :hover {
    background: var(--color-bg-drop-down-hover);
  }
  &[data-selected] {
    background: var(--color-bg-drop-down-selected);
  }
`;

const OptionComponent: FC<{ className?: string; value?: any }> = ({
  className,
  value,
  children,
}) => {
  const { value: selectedValue, onChange, format } = useContext(SelectContext);

  const mouseUpHandler = useCallback(() => {
    onChange(value);
  }, [onChange, value]);

  return (
    <OptionContainer
      className={className}
      data-selected={value === selectedValue ? 1 : undefined}
      onMouseUp={mouseUpHandler}
    >
      {children}
      {format(value)}
    </OptionContainer>
  );
};

export const Option = styled(OptionComponent).withConfig({
  displayName: "option",
})``;

const DropDown = styled.div.withConfig({
  displayName: "drop-down",
})`
  position: fixed;
  user-select: none;
  color: var(--color-fg-drop-down);
  background-color: var(--color-bg-drop-down);
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0 2px 6px #0006;

  hr {
    border: 0;
    border-top: 1px solid #fff3;
    margin-left: 8px;
    margin-right: 8px;
  }
`;

const DropDownOverlay = styled.div.withConfig({
  displayName: "drop-down-overlay",
})`
  position: fixed;
  background-color: transparent;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`;

export const SelectContainer = styled.div.withConfig({
  displayName: "select-container",
})`
  display: flex;
  padding-left: 7px;
  padding-right: 5px;
  align-items: center;
  border-radius: var(--radius-ui);
  height: 28px;
  overflow: hidden;
`;

const ChevronDown = styled<FC<{ className?: string }>>(({ className }) => (
  <span className={className}>&#8744;</span>
)).withConfig({ displayName: "chevron-down" })`
  margin-left: 5px;
  color: var(--color-icon);
`;

export const SelectValue = styled.span.withConfig({
  displayName: "select-value",
})`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectComponent: FC<{
  className?: string;
  value?: any;
  icon?: ReactNode;
  onChange?(newValue?: any): void;
  format?(value: any): ReactNode;
}> = ({ children, className, value, icon, onChange, format }) => {
  const valueRef = useRef(value);

  valueRef.current = value;

  const containerRef = useRef<HTMLDivElement>(null);

  const [opened, setOpened] = useState(false);

  const changeHandler = useCallback(
    (nextValue) => {
      if (valueRef.current === nextValue) return;

      onChange?.(nextValue);
      setOpened(false);
    },
    [onChange]
  );

  const formatValue = useCallback(
    (value: any) => (format ? format(value) : String(value)),
    [format]
  );

  const context = useMemo(
    () => ({
      value,
      onChange: changeHandler,
      format: formatValue,
    }),
    [changeHandler, formatValue, value]
  );

  const selectMouseDownHandler: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setOpened(true);
    }, []);

  const overlayMouseDownHandler: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setOpened(false);
    }, []);

  return (
    <div ref={containerRef} className={className}>
      <SelectContainer onMouseDown={selectMouseDownHandler}>
        {icon}
        <SelectValue>{formatValue(value)}</SelectValue>
        <ChevronDown />
      </SelectContainer>
      {opened ? (
        <SelectContext.Provider value={context}>
          <DropDownOverlay onMouseDown={overlayMouseDownHandler} />
          <DropDown>{children}</DropDown>
        </SelectContext.Provider>
      ) : null}
    </div>
  );
};

export const Select = styled(SelectComponent).withConfig({
  displayName: "select",
})`
  user-select: none;
`;
