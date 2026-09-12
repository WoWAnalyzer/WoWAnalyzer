import { JSX } from 'react';
import styles from './LoadingSpinner.module.scss';
import clsx from 'clsx';

export default function LoadingSpinner(props: React.ComponentProps<'div'>): JSX.Element {
  return <div {...props} className={clsx(props.className, styles.loader)} />;
}
