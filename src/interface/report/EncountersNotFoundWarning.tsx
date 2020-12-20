import React from 'react';
import { Trans } from '@lingui/macro';

import Warning from 'interface/Alert/Warning';

const EncountersNotFoundWarning = () => (
    <div className="container">
      <Warning style={{ marginBottom: 30 }}>
        <h2><Trans id="interface.report.encountersNotFoundWarning.noEncountersFound">No Encounters Found</Trans></h2>
        <Trans id="interface.report.encountersNotFoundWarning.noEncountersFoundDetails">
          We were unable to find any encounters in this report. If Warcraft Logs shows a dungeon or boss encounter on this report, then try refreshing this page (Press F5) to re-pull the report from Warcraft Logs. Additionally, please note that due to the way combat logs work, we are unable to evaluate Target Dummy logs.
        </Trans>
      </Warning>
    </div>
  );

export default EncountersNotFoundWarning;
