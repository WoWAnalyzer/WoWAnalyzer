import { IGNORE_SPEC_NOT_SUPPORTED_WARNING } from 'interface/actions/specNotSupported';
import { AnyAction } from 'redux';

export type SpecsIgnoredNotSupportedWarningState = number[];

export default function specsIgnoredNotSupportedWarning(
  state: SpecsIgnoredNotSupportedWarningState = [],
  action: AnyAction,
) {
  switch (action.type) {
    case IGNORE_SPEC_NOT_SUPPORTED_WARNING:
      return [...state, action.payload];
    default:
      return state;
  }
}
