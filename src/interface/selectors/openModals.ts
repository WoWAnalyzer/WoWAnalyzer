import { RootState } from 'store';

export const getOpenModalCount = (state: RootState) => state.openModals.length;
export const getTopModal = (state: RootState) => state.openModals.at(-1);
