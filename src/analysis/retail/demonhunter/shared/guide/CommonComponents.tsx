import { clsx } from 'clsx';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import styles from './CommonComponents.module.scss';

export const ExplanationSection = forwardRef<HTMLElement, ComponentPropsWithoutRef<'section'>>(
  ({ className, ...props }, ref) => (
    <section {...props} ref={ref} className={clsx(styles.explanationSection, className)} />
  ),
);
