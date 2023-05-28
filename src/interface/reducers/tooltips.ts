import { AnyAction } from 'redux';
import { RESET, SET_BASE_URL } from 'interface/actions/tooltips';

export interface TooltipsState {
  baseUrl: string;
}

const defaultState: TooltipsState = {
  baseUrl: 'https://wowhead.com/',
};

export default function tooltips(state: TooltipsState = defaultState, action: AnyAction) {
  switch (action.type) {
    case RESET:
      return defaultState;
    case SET_BASE_URL:
      return { ...state, baseUrl: action.payload };
    default:
      return state;
  }
}
