import { createContext, useContext } from 'react';
import ParseResults from 'parser/core/ParseResults';

export interface ResultsContextValue {
  generateResults: () => void;
  results: ParseResults | null;
}

export const ResultsContext = createContext<ResultsContextValue>({
  generateResults: () => {
    // no-op
  },
  results: null,
});

export const useResults = () => useContext(ResultsContext);
