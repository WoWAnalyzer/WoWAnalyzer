import { createContext, useContext } from 'react';
import ParseResults from 'parser/core/ParseResults';
import BOSS_PHASES_STATE from 'interface/report/BOSS_PHASES_STATE';
import EVENT_PARSING_STATE from 'interface/report/EVENT_PARSING_STATE';

export interface LoadingStatus {
  progress?: number;

  isLoadingParser?: boolean;
  isLoadingEvents?: boolean;
  bossPhaseEventsLoadingState?: BOSS_PHASES_STATE;
  isLoadingCharacterProfile?: boolean;
  isLoadingPhases?: boolean;
  isFilteringEvents?: boolean;
  parsingState?: EVENT_PARSING_STATE;
}

export interface ResultsContextValue {
  adjustForDowntime: boolean;
  setAdjustForDowntime: (p: boolean) => void;
  generateResults: () => void;
  isLoading: boolean;
  loadingStatus: LoadingStatus;
  results: ParseResults | null;
}

export const ResultsContext = createContext<ResultsContextValue>({
  adjustForDowntime: false,
  setAdjustForDowntime: () => {
    // no-op
  },
  generateResults: () => {
    // no-op
  },
  isLoading: false,
  loadingStatus: {},
  results: null,
});

export const useResults = () => useContext(ResultsContext);
