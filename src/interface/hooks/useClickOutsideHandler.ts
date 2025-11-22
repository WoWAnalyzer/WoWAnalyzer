import { useEffect } from 'react';

/**
 * Run `handler` when a click occurs on an element outside the trees contained by `ignoredContainers`.
 *
 * `ignoredContainers` is treated like a stable ref, even if it isn't one. Changes to it will not be reflected.
 */
export default function useClickOutsideHandler(
  ignoredContainers: React.MutableRefObject<HTMLElement | null>[],
  handler: () => void,
): void {
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!event.target) {
        return;
      }

      const target = event.target as Node;
      if (
        document.contains(target) &&
        !ignoredContainers.some(
          (ref) => ref.current === target || ref.current?.contains(target.parentNode),
        )
      ) {
        handler();
      }
    };
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };
    document.addEventListener('click', clickHandler);
    document.addEventListener('keyup', escHandler);
    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keyup', escHandler);
    };
  }, [handler]); // eslint-disable-line react-hooks/exhaustive-deps
}
