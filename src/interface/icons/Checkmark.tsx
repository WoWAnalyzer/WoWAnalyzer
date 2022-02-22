import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// Original 'cross' icon by Andrey from the Noun Project - https://thenounproject.com/term/cross/1147331/
// Adapted to similar 'checkmark' by kfinch
const Icon = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="15 15 70 70" className="icon stroke" {...props}>
    <g style={{ strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: 10 }}>
      <line x1="20" y1="45" x2="40" y2="75" />
      <line x1="40" y1="75" x2="80" y2="25" />
    </g>
  </svg>
);

export default Icon;
