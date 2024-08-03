import { useConfig } from 'interface/report/ConfigContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import About from 'interface/report/Results/About';
import ResultsChangelogTab from 'interface/ResultsChangelogTab';

export function Component() {
  const config = useConfig();
  usePageView('Results/About');
  return (
    <div className="container">
      <About config={config} />

      <ResultsChangelogTab changelog={config.changelog} />
    </div>
  );
}
