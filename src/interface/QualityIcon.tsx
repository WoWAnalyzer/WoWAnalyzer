import cssComponent from "interface/utils/css-component";
import styles from "./QualityIcon.module.scss";
import { ComponentProps } from 'react';

const Img = cssComponent("img", styles.Img, [] as const);

interface QualityIconProps extends Exclude<ComponentProps<typeof Img>, 'src' | 'alt' | 'title'> {
  quality: number;
}

/**
 * Display a "diamond" style icon to signify quality of crafted items.
 *
 * `quality` is the tier of the item, 1-5.
 */
const QualityIcon = ({ quality, ...props }: QualityIconProps) => (
  <Img
    src={`/quality/tier${quality}.png`}
    alt={`Quality: ${quality}`}
    title={`Quality: ${quality}`}
    {...props}
  />
);

export default QualityIcon;
