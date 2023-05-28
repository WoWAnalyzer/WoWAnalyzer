import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/icon/potion-1121420/
// Created by Kennan Yordle from The Noun Project
const Icon = (props: Props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="icon" {...props}>
    <path d="M60.5 31v-4h3v-5.5h-27V27h3v4a27.992 27.992 0 0 0-16.504 18.559A27.998 27.998 0 0 0 50 84.958a27.997 27.997 0 0 0 27.004-35.399A27.993 27.993 0 0 0 60.5 31zM41.5 13.5h17c1.105 0 2 1.105 2 2v2c0 1.105-.895 2-2 2h-17c-1.105 0-2-1.105-2-2v-2c0-1.105.895-2 2-2z" />
  </svg>
);

export default Icon;
