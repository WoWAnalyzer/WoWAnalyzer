import React from 'react';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import TALENT_DESCRIPTIONS from './TALENT_DESCRIPTIONS';

export default {
  spec: SPECS.WINDWALKER_MONK,
  maintainer: '@AttilioLH',
  parser: CombatLogParser,
  talentDescriptions: TALENT_DESCRIPTIONS,
   footer: (
    <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
      <div className="panel-body text-muted">
        Based on Guides from <a href='https://www.peakofserenity.com/'>Peak of Serenity</a>.<br />
      </div>
    </div>
  ),
};
