import { IGNORE_PREVIOUS_PATCH_WARNING } from 'interface/actions/previousPatch';
import { AnyAction } from 'redux';

export type ReportCodesIgnoredPreviousPatchWarning = string[];

export default function reportCodesIgnoredPreviousPatchWarning(
  state: ReportCodesIgnoredPreviousPatchWarning = [],
  action: AnyAction,
) {
  switch (action.type) {
    case IGNORE_PREVIOUS_PATCH_WARNING:
      return [...state, action.payload];
    default:
      return state;
  }
}
