import { AnyAction } from 'redux';
import { INTERNET_EXPLORER } from 'interface/actions/internetExplorer';

export type InternetExplorerState = boolean;

export default function internetExplorer(state: InternetExplorerState = false, action: AnyAction) {
  switch (action.type) {
    case INTERNET_EXPLORER:
      return true;
    default:
      return state;
  }
}
