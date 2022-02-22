import { SET_REPORT } from 'interface/actions/report';
import Report from 'parser/core/Report';
import { AnyAction } from 'redux';

export type ReportState = Report | null;

export default function report(state: ReportState = null, action: AnyAction) {
  switch (action.type) {
    case SET_REPORT:
      return action.payload;
    default:
      return state;
  }
}
