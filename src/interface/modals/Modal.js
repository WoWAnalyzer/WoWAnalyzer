import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CloseIcon from 'interface/icons/Cross';
import Portal from 'interface/Portal';
import { openModal, closeModal } from 'interface/actions/modals';

import './Modal.scss';

class Modal extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.openModal();
  }
  componentWillUnmount() {
    this.props.closeModal();
  }

  render() {
    const { children, onClose } = this.props;

    return (
      <Portal>
        <aside className="modal">
          <div className="container">
            <button className="close" onClick={onClose}>
              <CloseIcon />
            </button>
            <div className="content">
              {children}
            </div>
          </div>
        </aside>
      </Portal>
    );
  }
}

export default connect(
  null,
  {
    openModal,
    closeModal,
  }
)(Modal);
