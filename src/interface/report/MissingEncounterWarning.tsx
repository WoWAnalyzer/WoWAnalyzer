import React from 'react';
import { Trans } from '@lingui/macro';

import Warning from 'interface/Alert/Warning';

const MissingEncounterWarning = () => (
    <div className="container">
      <Warning style={{ marginBottom: 15 }}>
        <h2><Trans id="interface.report.missingEncounterWarning.missingEncounter">Missing Boss Pulls/Kills?</Trans></h2>
        <Trans id="interface.report.missingEncounterWarning.missingEncounterDetails">
          If a boss is missing from the list below, or there are no encounters listed, click the Refresh button above to re-pull the log from Warcraft Logs. Additionally, please note that due to the way combat logs work, we are unable to evaluate Target Dummy logs.
        </Trans>
      </Warning>
    </div>
  );

export default MissingEncounterWarning;
