import { memo } from 'react';

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
  try {
    root().removeChild(elem);
  } catch (err) {
    // crawling bots trigger this frequently due to the dom behaving differently.
    // see tags on WOWANALYZER-APP-WVR for example
    console.error('Failed to remove portal target', err);
    if (navigator.userAgent.match(/PetalBot/i) === null) {
      throw err;
    }
  }
};

const PortalTarget = () => <div id={ROOT_ELEMENT_ID} />;

export default memo(PortalTarget);
