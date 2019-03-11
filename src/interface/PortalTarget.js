import React from 'react';

const ROOT_ELEMENT_ID = 'portal-target';

class PortalTarget extends React.PureComponent {
  /**
   * The element which contains all the modals.
   * @returns {HTMLElement}
   * @private
   */
  static get _root() {
    return document.getElementById(ROOT_ELEMENT_ID);
  }
  /**
   * Make a new element in the modal target that can be used to render something.
   * @returns {HTMLElement}
   */
  static newElement() {
    const elem = document.createElement('div');
    this._root.appendChild(elem);
    return elem;
  }
  static remove(elem) {
    this._root.removeChild(elem);
  }

  render() {
    return (
      <div id={ROOT_ELEMENT_ID} />
    );
  }
}

export default PortalTarget;
