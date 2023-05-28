import { OPEN_MODAL, CLOSE_MODAL } from 'interface/actions/modals';
import { AnyAction } from 'redux';

export type ModalState = string[];

export default function openModals(state: ModalState = [], action: AnyAction) {
  switch (action.type) {
    case OPEN_MODAL:
      return [...state, action.key];
    case CLOSE_MODAL:
      return state.filter((key) => key !== action.key);
    default:
      return state;
  }
}
