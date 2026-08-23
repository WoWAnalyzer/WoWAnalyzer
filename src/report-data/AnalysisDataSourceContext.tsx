import { createContext, useContext } from 'react';

import type { AnalysisDataSource } from './AnalysisDataSource';

export const AnalysisDataSourceContext = createContext<AnalysisDataSource | undefined>(undefined);

export const useAnalysisDataSource = () => {
  const source = useContext(AnalysisDataSourceContext);
  if (!source) {
    throw new Error('Unable to get analysis data source');
  }
  return source;
};
