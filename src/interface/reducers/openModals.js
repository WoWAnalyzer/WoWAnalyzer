import { OPEN_MODAL, CLOSE_MODAL } from 'interface/actions/modals';

export default function openModals(state = 0, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return state + 1;
    case CLOSE_MODAL:
      return state - 1;
    default:
      return state;
  }
}
