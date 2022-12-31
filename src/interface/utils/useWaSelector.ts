import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from 'store';

export const useWaSelector: TypedUseSelectorHook<RootState> = useSelector;
