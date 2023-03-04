import { openModal, closeModal } from 'interface/actions/modals';
import CloseIcon from 'interface/icons/Cross';
import Portal from 'interface/Portal';
import { useEffect } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import './Modal.scss';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(openModal());
    return () => {
      dispatch(closeModal());
    };
  }, [dispatch]);

  return (
    <Portal>
      <aside className="modal" role="dialog" aria-modal>
        <div className="container">
          <button className="close" onClick={onClose}>
            <CloseIcon />
          </button>
          <div className="content">{children}</div>
        </div>
      </aside>
    </Portal>
  );
};

export default Modal;
