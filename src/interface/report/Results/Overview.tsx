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
  defaultGuide,
}: {
  guideMode: boolean;
  setGuideMode: (value: boolean) => void;
  defaultGuide: boolean;
}) => (
  <a style={{ justifySelf: 'end' }} href="#prototype" onClick={() => setGuideMode(!guideMode)}>
    {defaultGuide
      ? guideMode
        ? 'View Old Version'
        : 'Return to Guide View'
      : guideMode
        ? 'Return to Normal View'
        : 'View Prototype'}
  </a>
);

const Overview = ({ guide: GuideComponent, checklist, issues }: Props) => {
  const config = useConfig();

  const sessionGuideSetting = window.sessionStorage?.getItem('guideMode');
  const configGuideSetting = Boolean(config.guideDefault);
  const configOnlyGuideSetting = Boolean(config.guideOnly);
  let initialGuideSetting =
    sessionGuideSetting === null ? configGuideSetting : Boolean(sessionGuideSetting);
  if (configGuideSetting || configOnlyGuideSetting) {
    initialGuideSetting = true;
  }

  const [guideMode, setGuideMode] = React.useState(initialGuideSetting);

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
      {!configOnlyGuideSetting && (
        <PrototypeSwitcher
          defaultGuide={configGuideSetting}
          guideMode={guideMode}
          setGuideMode={setMode}
        />
      )}
      <GuideComponent />
    </div>
  ) : (
    <div className="container" style={{ display: 'grid' }}>
      {GuideComponent && (
        <PrototypeSwitcher
          defaultGuide={configGuideSetting}
          guideMode={guideMode}
          setGuideMode={setMode}
        />
      )}
      {alert}

      {config.pages?.overview?.hideChecklist !== true && <Checklist>{checklist}</Checklist>}

      <Suggestions style={{ marginBottom: 0 }}>{issues}</Suggestions>
    </div>
  );
};

export default Overview;
