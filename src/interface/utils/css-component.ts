import React, { HTMLElementType } from 'react';

type VarProps<V extends string[]> = Partial<Record<V[number], string | number | boolean>>;

export default function cssComponent<T extends HTMLElementType, V extends string[]>(
  el: T,
  className: string,
  vars: V,
): React.FC<React.ComponentPropsWithRef<T> & VarProps<V>>;
export default function cssComponent<
  P extends { className?: string },
  T extends React.FC<P> | React.ComponentClass<P>,
  V extends string[],
>(el: T, className: string, vars: V): React.FC<React.ComponentProps<T> & VarProps<V>>;
export default function cssComponent<
  P extends { className?: string },
  T extends HTMLElementType | React.FC<P> | React.ComponentClass<P>,
  V extends string[],
>(el: T, className: string, vars: V) {
  return (props: React.ComponentProps<T> & VarProps<V>) => {
    const varStyle: Record<string, number | string> = {};
    for (const varName of vars) {
      if (varName in props) {
        const value = (props as Record<string, string | number>)[varName];
        if (typeof value === 'boolean') {
          // whitespace hack for var
          if (value) {
            varStyle[`--${varName}`] = ' ';
          }
        } else {
          varStyle[`--${varName}`] = value;
        }
        delete (props as Record<string, unknown>)[varName];
      }
    }
    const style =
      'style' in props && props.style
        ? {
            ...props.style,
            ...varStyle,
          }
        : varStyle;

    if ('style' in props) {
      delete props.style;
    }

    React.createElement(el, {
      ...props,
      style: style,
      className: `${className} ${'className' in props ? props.className : ''}`,
    } as React.Attributes & P);
  };
}
