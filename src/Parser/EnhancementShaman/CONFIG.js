import React from 'react';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.ENHANCEMENT_SHAMAN,
  maintainer: '@Nighteyez07',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  footer: (
    <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
      <div className="panel-body text-muted">
        Questions about Enhancement? Visit <a href='http://www.discord.me/earthshrine'>Earthshrine</a> Discord.<br />
      </div>
    </div>
  ),
};
