import { TooltipElement } from 'interface/Tooltip';
import { useState } from 'react';
import Toggle from 'react-toggle';

import 'react-toggle/style.css';

import Changelog from './Changelog';
import { ChangelogEntry } from 'common/changelog';

interface Props {
  changelog: ChangelogEntry[];
  limit: number;
  includeCore: boolean;
}

const ResultsChangelogTab = ({ includeCore = true, changelog, limit }: Props) => {
  const [includeCoreState, setIncludeCoreState] = useState(includeCore);

  return (
    <div className="panel">
      <div className="panel-heading">
        {includeCore && (
          <div className="pull-right toggle-control text-muted">
            <Toggle
              defaultChecked={includeCoreState}
              icons={false}
              onChange={(event) => setIncludeCoreState(event.target.checked)}
              id="core-entries-toggle"
            />{' '}
            <label htmlFor="core-entries-toggle">
              <TooltipElement content="Turn this off to only see changes to this spec's implementation.">
                Shared changes
              </TooltipElement>
            </label>
          </div>
        )}
        <h1>Changelog</h1>
      </div>
      <div className="panel-body">
        <Changelog includeCore={includeCoreState} changelog={changelog} limit={limit} />
      </div>
    </div>
  );
};

export default ResultsChangelogTab;
