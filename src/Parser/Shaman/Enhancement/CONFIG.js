import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.ENHANCEMENT_SHAMAN,
  maintainer: '@Nighteyez07',
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
  // footer: (
  //   <div className="panel fade-in" style={{ margin: '15px auto 30px', maxWidth: 400, textAlign: 'center' }}>
  //     <div className="panel-body text-muted">
  //       Questions about Enhancement? Visit <a href="http://www.discord.me/earthshrine">Earthshrine</a> Discord.<br />
  //     </div>
  //   </div>
  // ),
};
