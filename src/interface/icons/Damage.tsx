import * as React from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'img'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/term/duration/370713/
// duration by Bohdan Burmich from the Noun Project
const Icon = (props: Props) => (
  <img src="/img/sword.png" alt="Damage" className="icon" {...props} />
);

export default Icon;
