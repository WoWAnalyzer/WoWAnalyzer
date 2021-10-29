import { OPEN_MODAL, CLOSE_MODAL } from 'interface/actions/modals';
import { AnyAction } from 'redux';

export type ModalState = number;

export default function openModals(state: ModalState = 0, action: AnyAction) {
  switch (action.type) {
    case OPEN_MODAL:
      return state + 1;
    case CLOSE_MODAL:
      return state - 1;
    default:
      return state;
  }
}
