import { getAlertComponent } from 'interface/Alert';
import { Suggestion } from 'parser/core/CombatLogParser';
import { Issue } from 'parser/core/ParseResults';
import React, { ReactNode } from 'react';

import { useConfig } from '../ConfigContext';
import Checklist from './ChecklistPanel';
import Suggestions from './Suggestions';

interface Props {
  checklist?: React.ReactNode;
  issues: Array<Issue | Suggestion>;
}

const Overview = ({ checklist, issues }: Props) => {
  const config = useConfig();

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

  return (
    <div className="container">
      {alert}

      {config.pages?.overview?.hideChecklist !== true && <Checklist>{checklist}</Checklist>}

      <Suggestions style={{ marginBottom: 0 }}>{issues}</Suggestions>
    </div>
  );
};

export default Overview;
