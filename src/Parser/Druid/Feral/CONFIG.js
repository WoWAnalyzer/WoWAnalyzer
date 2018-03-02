import { Thieseract } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FERAL_DRUID,
  maintainers: [Thieseract],
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
  // footer: (
  //   <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
  //     <div className="panel-body text-muted">
  //       Questions about Feral? Visit <a href="http://www.discord.me/Dreamgrove">Dreamgrove</a> Discord.<br />
  //     </div>
  //   </div>
  // ),
};
