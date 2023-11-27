import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/icon/arrow-1569918/
// Created by unlimicon from the Noun Project
const Arrow = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="icon" {...props}>
    <path
      d="M80 1002.362c0-.463-.28-1.077-.564-1.375l-16-17c-.747-.773-1.957-.862-2.828-.079-.778.701-.798 2.068-.078 2.829l12.844 13.625H22a2 2 0 1 0 0 4h51.374l-12.844 13.625c-.72.76-.669 2.094.078 2.828.789.775 2.093.706 2.828-.078l16-17c.47-.461.556-.905.564-1.375z"
      overflow="visible"
      transform="translate(0 -952.362)"
    />
  </svg>
);

export default Arrow;
