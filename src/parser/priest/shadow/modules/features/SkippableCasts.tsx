import React from 'react';

import SPELLS from 'common/SPELLS';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const ONE_FILLER_GCD_HASTE_THRESHOLD = 1.4;

class SkippableCasts extends Analyzer {
  static dependencies = {
    haste: Haste,
    globalCooldown: GlobalCooldown,
  };
  protected haste!: Haste;
  protected globalCooldown!: GlobalCooldown;

  _castsSinceLastVoidBolt = 0;
  _skippableCastsBetweenVoidbolts = 0;

  get skippableCastsBetweenVoidbolts() {
    return this._skippableCastsBetweenVoidbolts;
  }

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
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
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`There should only be 1 cast between Void Bolts casts when you exceed 140% haste. You casted a total of ${skippableCasts} extra abilities inbetween, wasting insanity generation & damage.`}
      >
        <BoringSpellValueText spell={SPELLS.VOID_BOLT}>
          <>
            {skippableCasts} <small>Skippable casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SkippableCasts;
