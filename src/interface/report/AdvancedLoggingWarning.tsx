import React from 'react';
import { Trans } from '@lingui/macro';

import Warning from 'interface/Alert/Warning';

const AdvancedLoggingWarning = () => (
    <div className="container">
      <Warning style={{ marginBottom: 30 }}>
        <h2><Trans id="interface.report.advancedLoggingWarning.advancedLoggingWarning">Advanced Combat Logging not Enabled</Trans></h2>
        <Trans id="interface.report.advancedLoggingWarning.advancedLoggingWarningDetails">
          Without Advanced Combat Logging, we are unable to get critical information about players including specs, talents, and gear. Without this information we are unable to provide analysis for this encounter. Please ensure that Advanced Combat Logging is enabled in game (Can be found in the game settings under System/Network).
        </Trans>
      </Warning>
    </div>
  );

export default AdvancedLoggingWarning;
