import { type CSSProperties, type ComponentPropsWithoutRef, forwardRef } from 'react';

import styles from './Highlight.module.scss';

/**
 * An inline text highlight. Like using the highlight functionality in Word or Docs.
 *
 * Or like using a highlighter, I guess.
 */
type HighlightProps = ComponentPropsWithoutRef<'span'> & {
  color: string;
  textColor?: string;
};

type HighlightStyle = CSSProperties & {
  '--highlight-background-color': string;
  '--highlight-text-color'?: string;
};

export const Highlight = forwardRef<HTMLSpanElement, HighlightProps>(
  ({ color, textColor, className, style, ...props }, ref) => {
    const highlightStyle: HighlightStyle = {
      ...style,
      '--highlight-background-color': color,
      ...(textColor ? { '--highlight-text-color': textColor } : {}),
    };

    return (
      <span
        {...props}
        ref={ref}
        className={className ? `${styles.highlight} ${className}` : styles.highlight}
        style={highlightStyle}
      />
    );
  },
);
