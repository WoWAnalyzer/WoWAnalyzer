import React, { useRef, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';

import { newElement, removeElement } from './PortalTarget';

const Portal = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLElement>();

  useEffect(() => {
    ref.current = newElement();
    return () => {
      if (ref.current) {
        removeElement(ref.current);
      }
    };
  }, []);

  return ref.current ? ReactDOM.createPortal(children, ref.current) : null;
};

export default memo(Portal);
