import styled from '@emotion/styled';
import { ComponentProps } from 'react';

const Img = styled.img`
  display: inline-block;
  height: 1em;
  width: 1em;
`;

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
