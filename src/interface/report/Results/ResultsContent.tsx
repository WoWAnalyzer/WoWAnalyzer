import ErrorBoundary from 'interface/ErrorBoundary';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import { useResults } from 'interface/report/Results/ResultsContext';
import { useParams } from 'react-router-dom';
import { usePageView } from 'interface/useGoogleAnalytics';

export const DefaultTab = () => {
  const { resultTab } = useParams();
  const { isLoading, results } = useResults();
  usePageView('Results/CustomTab', resultTab);

  if (isLoading || !results) {
    return <ResultsLoadingIndicator />;
  }

  const tab = results.tabs.find((tab) => tab.url === resultTab);

  return (
    <div className="container">
      <ErrorBoundary>{tab ? tab.render() : '404 tab not found'}</ErrorBoundary>
    </div>
  );
};
