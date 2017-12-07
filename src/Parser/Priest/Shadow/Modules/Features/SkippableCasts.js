import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellIcon from 'common/SpellIcon';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

import ABC from './AlwaysBeCasting';

class SkippableCasts extends Analyzer {
  static dependencies = {
    ABC: ABC,
  };


  on_initialized() {
    this.active = true;
  }


  statistic() {
    const skippableCasts = this.ABC.skippableCastsBetweenVoidbolts;

    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.VOID_BOLT.id} />}
        value={skippableCasts}
        label={(
          <dfn data-tip={`There should only be 1 cast between Void Bolts casts when you exceed 120% haste. You casted a total of ${skippableCasts} extra abilities inbetween, wasting insanity generation & damage.`}>
            Skippable casts
          </dfn>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default SkippableCasts;
