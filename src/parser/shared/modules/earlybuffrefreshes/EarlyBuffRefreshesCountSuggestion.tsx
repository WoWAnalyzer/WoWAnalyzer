import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import EarlyBuffRefreshes from 'parser/shared/modules/earlybuffrefreshes/EarlyBuffRefreshes';

function suggest(when: any, suggestion: any, module: EarlyBuffRefreshes) {
  when(suggestion).addSuggestion((suggest: any, actual: any, recommended: any) => {
    return suggest(<>Avoid refreshing <SpellLink id={module.buff.id} /> too early. You can optimally refresh it with less than {module.pandemicWindowInSeconds} seconds remaining on the buff.</>)
      .icon(module.buff.icon)
      .actual(<>{actual} of {module.casts} ({formatPercentage(module.earlyRefreshPercentage, 0)}%) early refreshes</>)
      .recommended(<>{recommended} is recommended</>);
  });
}

export default suggest;
