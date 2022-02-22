import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/term/swirl/3553084
// swirl by Gregor Cresnar from the Noun Project
const Icon = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="15 15 70 70" className="icon" {...props}>
    <path d="M26,58A28,28,0,0,1,54,30a20,20,0,0,1,0,40,12,12,0,0,1,0-24,4,4,0,0,1,0,8H50v8h4a12,12,0,0,0,0-24,20,20,0,0,0,0,40,28,28,0,0,0,0-56A36,36,0,0,0,18,58V74h8Z" />
  </svg>
);

export default Icon;
