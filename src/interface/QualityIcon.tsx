import { clsx } from 'clsx';
import { ComponentProps } from 'react';
import styles from './QualityIcon.module.scss';

interface QualityIconProps extends Exclude<ComponentProps<'img'>, 'src' | 'alt' | 'title'> {
  quality: number;
}

/**
 * Display a "diamond" style icon to signify quality of crafted items.
 *
 * `quality` is the tier of the item, 1-5.
 */
const QualityIcon = ({ quality, className, ...props }: QualityIconProps) => (
  <img
    className={clsx(styles.img, className)}
    src={`/quality/tier${quality}.png`}
    alt={`Quality: ${quality}`}
    title={`Quality: ${quality}`}
    {...props}
  />
);

export default QualityIcon;
