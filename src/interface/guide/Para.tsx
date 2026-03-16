import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

import styles from './Para.module.scss';

/**
 * A `div` with `p`-style padding.
 *
 * This can be used to address DOM nesting errors while preserving padding.
 */
const Para = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={clsx(styles.para, className)} />
);

export default Para;
