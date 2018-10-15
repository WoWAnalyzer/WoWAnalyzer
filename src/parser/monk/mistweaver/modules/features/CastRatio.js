import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/core/modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

/* Add in Statistic box to show Vivfy to Enveloping Mist Cast ratio.
 * TODO:
 * Add in suggestion thresholds and checklist item on ratio. Need additional log data to implement.
*/

class CastRatio extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  statistic() {
    const getAbility = spellId => this.abilityTracker.getAbility(spellId);

    const evmCasts = getAbility(SPELLS.ENVELOPING_MIST.id).casts;
    const vivCasts = getAbility(SPELLS.VIVIFY.id).casts;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(10)}
        //icon={}
        value={<React.Fragment><SpellIcon id={SPELLS.ENVELOPING_MIST.id} /> {evmCasts} : <SpellIcon id={SPELLS.VIVIFY.id} /> {vivCasts}</React.Fragment>}
        label={(
          <dfn data-tip={``}>
            Enveloping Mist to Vivify Casts
          </dfn>
        )}
      />
    );
  }
}

export default CastRatio;
