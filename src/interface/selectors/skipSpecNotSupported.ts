import { RootState } from 'store';

export const getSpecsIgnoredNotSupportedWarning = (state: RootState) =>
  state.specsIgnoredNotSupportedWarning;
