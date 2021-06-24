import AlertInfo from 'interface/AlertInfo';
import AlertWarning from 'interface/AlertWarning';
import { TextType } from 'parser/Config';
import { Issue } from 'parser/core/ParseResults';
import React, { ReactNode } from 'react';

import { useConfig } from '../ConfigContext';
import Checklist from './ChecklistPanel';
import Suggestions from './Suggestions';

interface Props {
  checklist?: React.ReactNode;
  issues: Issue[];
}

const Overview = ({ checklist, issues }: Props) => {
  const config = useConfig();

  let alert: ReactNode = null;
  if (config.pages?.overview?.text) {
    const Component = config.pages?.overview?.type === TextType.Info ? AlertInfo : AlertWarning;

    alert = (
      <Component
        style={{
          marginBottom: 30,
        }}
      >
        {config.pages?.overview?.text}
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
