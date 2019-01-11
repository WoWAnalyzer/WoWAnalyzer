import { IGNORE_PREVIOUS_PATCH_WARNING } from 'interface/actions/previousPatch';

export default function reportCodesIgnoredPreviousPatchWarning(state = [], action) {
  switch (action.type) {
    case IGNORE_PREVIOUS_PATCH_WARNING:
      return [
        ...state,
        action.payload,
      ];
    default:
      return state;
  }
}
