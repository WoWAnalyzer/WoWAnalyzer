import { RootState } from 'interface/reducers';

export const getSpecsIgnoredNotSupportedWarning = (state: RootState) =>
  state.specsIgnoredNotSupportedWarning;
