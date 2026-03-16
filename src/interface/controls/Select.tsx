import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as design from 'interface/design-system';
import styles from './Select.module.scss';

const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<'select'>>(
  ({ className, style, ...props }, ref) => (
    <select
      ref={ref}
      className={className ? `${styles.select} ${className}` : styles.select}
      style={{
        background: design.level2.background,
        border: `1px solid ${design.level2.border}`,
        boxShadow: design.level2.shadow,
        padding: `${design.gaps.small} ${design.gaps.medium}`,
        color: design.colors.bodyText,
        ...style,
      }}
      {...props}
    />
  ),
);

Select.displayName = 'Select';

export default Select;
