import React from 'react';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';

export default {
  spec: SPECS.ELEMENTAL_SHAMAN,
  parser: CombatLogParser,
  maintainer: '@fasib',
  footer: (
    <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
      <div className="panel-body text-muted">
        Based on Guides from <a href='https://www.stormearthandlava.com/'>Storm Earth and Lava</a>.<br />
        Questions about Elementals? Visit <a href='http://www.discord.me/earthshrine'>Earthshrine</a> Discord.<br />
      </div>
    </div>
  ),
};
