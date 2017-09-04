import React from 'react';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FERAL_DRUID,
  maintainer: '@Thieseract',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  footer: (
    <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
      <div className="panel-body text-muted">
        Questions about Feral? Visit <a href='http://www.discord.me/Dreamgrove'>Dreamgrove</a> Discord.<br />
      </div>
    </div>
  ),
};
