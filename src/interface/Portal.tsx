import { memo } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { root } from './PortalTarget';

const Portal = ({ children }: { children: React.ReactNode }) => {
  return ReactDOM.createPortal(children, root());
};

export default memo(Portal);
