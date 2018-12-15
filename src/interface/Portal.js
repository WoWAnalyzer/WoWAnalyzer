import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import PortalTarget from './PortalTarget';

class Portal extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };
  state = {
    elem: null,
  };
  componentDidMount() {
    this.setState({
      elem: PortalTarget.newElement(),
    });
  }
  componentWillUnmount() {
    PortalTarget.remove(this.state.elem);
  }

  render() {
    if (!this.state.elem) {
      return null;
    }
    return ReactDOM.createPortal(
      this.props.children,
      this.state.elem
    );
  }
}

export default Portal;
