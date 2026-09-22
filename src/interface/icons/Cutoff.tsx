import type { ComponentPropsWithoutRef } from 'react';

type Props = Omit<ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

const Icon = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="9 9 328 122" className="icon" {...props}>
    <path
      d="M 257 9 L 205 131 L 192 131 L 243 9 L 257 9M 286 9 L 296 9 C 317 9 337 29 337 50 L 337 90 C 337 111 317 131 296 131 L 225 131 L 276 9 z M 286 23 L 282 23 L 243 117 L 296 117 C 309 117 323 103 323 90 L 323 50 C 323 37 309 23 296 23 z
M 60 131 L 50 131 C 29 131 9 111 9 90 L 9 50 C 9 29 29 9 50 9 L 221 9 L 171 131 Z 
M 60 117 L 161 117 L 200 23 L 50 23 C 37 23 23 37 23 50 L 23 90 C 23 103 37 117 50 117 Z "
    />
  </svg>
);

export default Icon;
