import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { RootState } from 'interface/reducers';

export const useWaSelector: TypedUseSelectorHook<RootState> = useSelector;
