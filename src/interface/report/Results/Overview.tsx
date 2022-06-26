import { getAlertComponent } from 'interface/Alert';
import { Suggestion } from 'parser/core/CombatLogParser';
import { Issue } from 'parser/core/ParseResults';
import { ReactNode } from 'react';
import * as React from 'react';

import { useConfig } from '../ConfigContext';
import Checklist from './ChecklistPanel';
import Suggestions from './Suggestions';

interface Props {
  checklist?: React.ReactNode;
  issues: Array<Issue | Suggestion>;
  guide?: React.FC;
}

const PrototypeSwitcher = ({
  guideMode,
  setGuideMode,
}: {
  guideMode: boolean;
  setGuideMode: (value: boolean) => void;
}) => (
  <a style={{ justifySelf: 'end' }} href="#prototype" onClick={() => setGuideMode(!guideMode)}>
    {guideMode ? 'Return to Normal View' : 'View Prototype'}
  </a>
);

const Overview = ({ guide: GuideComponent, checklist, issues }: Props) => {
  const config = useConfig();
  const [guideMode, setGuideMode] = React.useState(
    window.sessionStorage?.getItem('guideMode') === 'true',
  );

  let alert: ReactNode = null;
  if (config.pages?.overview?.text) {
    const Component = getAlertComponent(config.pages.overview.type);

    alert = (
      <Component
        style={{
          marginBottom: 30,
        }}
      >
        {config.pages.overview.text}
      </Component>
    );
  }

  const setMode = React.useCallback((value: boolean) => {
    window.sessionStorage.setItem('guideMode', value.toString());
    setGuideMode(value);
  }, []);

  return guideMode && GuideComponent ? (
    <div className="container" style={{ display: 'grid' }}>
      <PrototypeSwitcher guideMode={guideMode} setGuideMode={setMode} />
      <GuideComponent />
    </div>
  ) : (
    <div className="container" style={{ display: 'grid' }}>
      {GuideComponent && <PrototypeSwitcher guideMode={guideMode} setGuideMode={setMode} />}
      {alert}

      {config.pages?.overview?.hideChecklist !== true && <Checklist>{checklist}</Checklist>}

      <Suggestions style={{ marginBottom: 0 }}>{issues}</Suggestions>
    </div>
  );
};

export default Overview;
