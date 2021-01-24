import { IGNORE_SPEC_NOT_SUPPORTED_WARNING } from 'interface/actions/specNotSupported';

export default function specsIgnoredNotSupportedWarning(state = [], action) {
  switch (action.type) {
    case IGNORE_SPEC_NOT_SUPPORTED_WARNING:
      return [
        ...state,
        action.payload,
      ];
    default:
      return state;
  }
}
