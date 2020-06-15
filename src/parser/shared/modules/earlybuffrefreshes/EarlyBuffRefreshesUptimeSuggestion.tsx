import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import EarlyBuffRefreshes from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshes';

function suggest(when: any, suggestion: any, module: EarlyBuffRefreshes) {
  when(suggestion).addSuggestion((suggest: any, actual: any, recommended: any) => {
    return suggest(<>Maintain <SpellLink id={module.spell.id} /> as long as possible. You can refresh this as early as {module.pandemicWindowInSeconds} seconds remaining on the buff.</>)
      .icon(module.buff.icon)
      .actual(<>{actual} of {module.casts} ({formatPercentage(module.earlyRefreshPercentage, 0)}%) early refreshes</>)
      .recommended(<>{recommended} is recommended</>);
  });
}

export default suggest;
