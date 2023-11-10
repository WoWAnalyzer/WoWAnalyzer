import CloseIcon from 'interface/icons/Cross';
import Portal from 'interface/Portal';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import './Modal.scss';
import { useWaSelector } from './utils/useWaSelector';
import { getTopModal } from './selectors/openModals';
import { closeModal, openModal } from './reducers/openModals';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  id: string;
}

const Modal = ({ children, onClose, id }: Props) => {
  const dispatch = useDispatch();

  const [hasDispatched, setHasDispatched] = useState(false);

  const topModal = useWaSelector(getTopModal);

  const isTopModal = !hasDispatched || topModal === id;

  useEffect(() => {
    dispatch(openModal(id));
    setHasDispatched(true);
    return () => {
      dispatch(closeModal(id));
    };
  }, [dispatch, id]);

  return (
    <Portal>
      <aside
        className="modal"
        role="dialog"
        aria-modal
        style={{ animation: isTopModal ? '' : 'blur 10ms forwards' }}
      >
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
