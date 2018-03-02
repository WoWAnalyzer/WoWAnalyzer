import { HawkCorrigan,fasib } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.ELEMENTAL_SHAMAN,
  maintainers: [HawkCorrigan,fasib],
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
  // footer: (
  //   <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
  //     <div className="panel-body text-muted">
  //       Based on Guides from <a href="https://www.stormearthandlava.com/">Storm Earth and Lava</a>.<br />
  //       Questions about Elementals? Visit <a href="http://www.discord.me/earthshrine">Earthshrine</a> Discord.<br />
  //     </div>
  //   </div>
  // ),
};
