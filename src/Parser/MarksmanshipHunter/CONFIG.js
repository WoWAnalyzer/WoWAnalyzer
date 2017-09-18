import React from 'react';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.MARKSMANSHIP_HUNTER,
  maintainer: '@JLassie82',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  footer: (
    <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
      <div className="panel-body text-muted">
        Questions about Marksmanship? Visit <a href="https://discord.gg/yqer4BX ">Trueshot Lodge</a> Discord.<br />
      </div>
    </div>
  ),
};
