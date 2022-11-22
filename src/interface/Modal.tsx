import { openModal, closeModal } from 'interface/actions/modals';
import CloseIcon from 'interface/icons/Cross';
import Portal from 'interface/Portal';
import { useEffect } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { getOpenModals } from 'interface/selectors/openModals';

import './Modal.scss';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: Props) => {
  // TODO: Figure out how to remove this but still force a re-render when the modal is "opened"
  useWaSelector((state) => getOpenModals(state));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(openModal());
    return () => {
      dispatch(closeModal());
    };
  }, [dispatch]);

  return (
    <Portal>
      <aside className="modal">
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
