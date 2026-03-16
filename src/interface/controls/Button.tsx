import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as design from 'interface/design-system';
import styles from './Button.module.scss';

const Button = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  ({ className, style, ...props }, ref) => (
    <button
      ref={ref}
      className={className ? `${styles.button} ${className}` : styles.button}
      style={{
        boxShadow: design.level2.shadow,
        background: design.level2.background,
        border: `1px solid ${design.level2.border}`,
        ...style,
      }}
      {...props}
    />
  ),
);

export default Button;
