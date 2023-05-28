import { memo } from 'react';

const ROOT_ELEMENT_ID = 'portal-target';

export const root = (): HTMLElement => {
  const elem = document.getElementById(ROOT_ELEMENT_ID);
  if (!elem) {
    throw new Error('PortalTarget could not find find root element');
  }
  return elem;
};

const PortalTarget = () => <div id={ROOT_ELEMENT_ID} />;

export default memo(PortalTarget);
