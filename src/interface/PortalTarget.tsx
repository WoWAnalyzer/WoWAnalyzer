import React, { memo } from 'react';

const ROOT_ELEMENT_ID = 'portal-target';

const root = (): HTMLElement => {
  const elem = document.getElementById(ROOT_ELEMENT_ID);
  if (!elem) {
    throw new Error('PortalTarget could not find find root element');
  }
  return elem;
};

export const newElement = () => {
  const elem = document.createElement('div');
  root().appendChild(elem);
  return elem;
};

export const removeElement = (elem: HTMLElement) => {
  root().removeChild(elem);
};

const PortalTarget = () => <div id={ROOT_ELEMENT_ID} />;

export default memo(PortalTarget);
