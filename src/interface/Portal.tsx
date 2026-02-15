import type { ReactNode } from 'react';
import { memo } from 'react';
import ReactDOM from 'react-dom';

import { root } from './PortalTarget';

const Portal = ({ children }: { children: ReactNode }) => {
  return ReactDOM.createPortal(children, root());
};

export default memo(Portal);
