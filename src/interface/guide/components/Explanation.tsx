import { ReactNode } from 'react';

/** A container for explanatory text.
 *  For now this is just a div, a future update will allow a toggle to hide all Explanations. */
export default function Explanation({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
