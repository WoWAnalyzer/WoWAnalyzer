import React, { ElementType, HTMLElementType } from 'react';

type VarProps<V extends string[]> = Partial<Record<V[number], string | number | boolean>>;

/**
 * Represents a ported emotion component. The component accepts a set of "var props". String and Number props are passed through directly (like `style={{ [`--${name}`]: value }}`), while *Boolean* props get special treatment.
 *
 * ## Boolean Props & the Space Hack
 *
 * We had a lot of emotion code like `color: ${props => props.active ? 'red' : 'green'}`. To automatically port this, the "space hack" is used, taking advantage of the leniency of CSS parsing. Specifically:
 *
 * ```css
 * color: var(--active, red) green;
 * ```
 *
 * When `props.active` is true, we set `--active: ;`, which makes `var(--active, red)` resolve to ` ` (whitespace), so we get `color: green;`.
 * When `props.active` is false, we don't set `--active` at all, which makes `var(--active, red)` resolve to `red`, so we get `color: red green;` which is parsed as `color: red;`.
 *
 * This only works for CSS properties that always take a single value, but that wasn't checked by the automated port so there could be some issues.
 *
 * -@deprecated This is a bridge component for the migration from emotion and shouldn't be used in new code.
 */
export default function cssComponent<T extends HTMLElementType, V extends string[]>(
  el: T,
  className: string,
  vars: V,
): React.FC<React.ComponentPropsWithRef<T> & VarProps<V> & { as?: ElementType }>;
// oxlint-disable-next-line typescript/no-explicit-any -- necessary for type inference
export default function cssComponent<T extends React.FC<any>, V extends string[]>(
  el: T,
  className: string,
  vars: V,
): React.FC<React.ComponentPropsWithRef<T> & VarProps<V>>;
export default function cssComponent<
  P extends { className?: string },
  T extends HTMLElementType | React.FC<P>,
  V extends string[],
>(el: T, className: string, vars: V) {
  return (rawProps: React.ComponentProps<T> & VarProps<V>) => {
    const varStyle: Record<string, number | string> = {};
    const props: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(rawProps)) {
      if (vars.includes(name)) {
        if (typeof value === 'boolean') {
          // whitespace hack for var
          if (value) {
            varStyle[`--${name}`] = ' ';
          }
        } else {
          varStyle[`--${name}`] = value;
        }
      } else if (name === 'innerRef') {
        // annoying explicit support for Tooltip
        props.ref = value;
      } else if (name !== 'style') {
        props[name] = value;
      }
    }

    const style =
      'style' in rawProps && rawProps.style
        ? {
            ...rawProps.style,
            ...varStyle,
          }
        : varStyle;

    return React.createElement(el, {
      ...(props as unknown as React.Attributes & P),
      style: style,
      className: `${className} ${'className' in props ? props.className : ''}`,
    } as React.Attributes & P);
  };
}
