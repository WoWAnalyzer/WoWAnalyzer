import { RootState } from 'interface/reducers';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

export const useWaSelector: TypedUseSelectorHook<RootState> = useSelector;
