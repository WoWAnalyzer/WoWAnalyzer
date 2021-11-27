import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

const Icon = (props: Props) => (
  <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" className="icon" {...props}>
    <path d="M0 25L25 0l25 25H37.4v25h-25V25H0z" />
  </svg>
);

export default Icon;
