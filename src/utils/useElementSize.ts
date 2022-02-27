import { RefObject, useLayoutEffect, useMemo, useState } from "react";

export function useElementSize<E extends Element>(
  ref: RefObject<E>
): { width: number; height: number } | void {
  const [size, setSize] = useState<{ width: number; height: number }>();

  const observer = useMemo(
    () =>
      new ResizeObserver((e) =>
        setSize({
          width: e[0].target.clientWidth,
          height: e[0].target.clientHeight,
        })
      ),
    []
  );

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [observer, ref]);

  return size;
}
