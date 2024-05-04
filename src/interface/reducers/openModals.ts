import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ModalState = string[];
const initialState = [] as ModalState;

const openModalsSlice = createSlice({
  name: 'openModals',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    openModal(state: ModalState, action: PayloadAction<string>) {
      return [...state, action.payload];
    },
    closeModal(state: ModalState, action: PayloadAction<string>) {
      return state.filter((key) => key !== action.payload);
    },
  },
});

export const { openModal, closeModal } = openModalsSlice.actions;
export default openModalsSlice.reducer;
