import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellIcon from 'common/SpellIcon';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import Haste from 'Parser/Core/Modules/Haste';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

const ONE_FILLER_GCD_HASTE_THRESHOLD = 1.4;

class SkippableCasts extends Analyzer {
  static dependencies = {
    haste: Haste,
    globalCooldown: GlobalCooldown,
  };

  _castsSinceLastVoidBolt = 0;
  _skippableCastsBetweenVoidbolts = 0;

  get skippableCastsBetweenVoidbolts() {
    return this._skippableCastsBetweenVoidbolts;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.haste.current >= ONE_FILLER_GCD_HASTE_THRESHOLD) {
      if (spellId === SPELLS.VOID_BOLT.id) {
        this._castsSinceLastVoidBolt = 0;
      } else if (this.globalCooldown.isOnGlobalCooldown(spellId)) {
        this._castsSinceLastVoidBolt += 1;
        if (this._castsSinceLastVoidBolt > 1) {
          this._skippableCastsBetweenVoidbolts += 1;
        }
      }
    }
  }

  statistic() {
    const skippableCasts = this.skippableCastsBetweenVoidbolts;

    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.VOID_BOLT.id} />}
        value={skippableCasts}
        label={(
          <dfn data-tip={`There should only be 1 cast between Void Bolts casts when you exceed 140% haste. You casted a total of ${skippableCasts} extra abilities inbetween, wasting insanity generation & damage.`}>
            Skippable casts
          </dfn>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default SkippableCasts;
