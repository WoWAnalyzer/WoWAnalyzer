import React from 'react';
import { Trans } from '@lingui/macro';

import Warning from 'interface/Alert/Warning';

const ClassicLogWarning = () => (
    <div className="container">
      <Warning style={{ marginBottom: 30 }}>
        <h2><Trans id="interface.report.classicLogWarning.classicEncounter">Classic WoW encounters detected</Trans></h2>
        <Trans id="interface.report.classicLogWarning.classicEncounterDetails">
          The current report contains encounters from World of Warcraft: Classic. Currently WoWAnalyzer does not support, and does not have plans to support, Classic WoW logs.
          </Trans>
      </Warning>
    </div>
  );

export default ClassicLogWarning;
