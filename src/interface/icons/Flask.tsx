import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/icon/flask-34265/
// Created by Cristiano Zoucas from The Noun Project
const Icon = (props: Props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="icon" {...props}>
    <path
      d="M63.051 21.25c-.898.602-1.934.898-3.102.898h-.347V45.25L80.55 72.852c1.398 1.868 1.969 3.918 1.699 6.149-.332 2.234-1.434 4.101-3.3 5.601-1.9 1.5-4.102 2.25-6.602 2.25l-45.5.25c-2.5.036-4.7-.699-6.602-2.199-1.898-1.469-3.016-3.336-3.352-5.601-.332-2.235.2-4.282 1.602-6.149l21.148-27.898.004-22.855v-.25h-.5c-1.168 0-2.2-.3-3.102-.898a10.76 10.76 0 0 1-.699-.551c-1-.934-1.5-2.05-1.5-3.352 0-1.367.5-2.515 1.5-3.449 1.066-.933 2.332-1.398 3.8-1.398H59.95c1.469 0 2.719.469 3.75 1.398 1.066.934 1.601 2.082 1.601 3.45 0 1.3-.53 2.417-1.601 3.351-.2.2-.418.383-.649.55z"
      fillRule="evenodd"
    />
  </svg>
);

export default Icon;
