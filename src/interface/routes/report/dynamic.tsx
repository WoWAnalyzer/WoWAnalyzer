import { useParams } from 'react-router-dom';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import ErrorBoundary from 'interface/ErrorBoundary';

export function Component() {
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
}
