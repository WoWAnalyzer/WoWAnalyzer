import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

class TwinMoons extends Analyzer {
  get percentTwoHits() {
    return (this.moonfireHits - this.moonfireCasts) / this.moonfireCasts;
  }

  moonfireCasts = 0;
  moonfireHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIN_MOONS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_BEAR), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE), this.onCast);
  }

  onDamage(event: DamageEvent) {
    if (event.tick === true) {
      return;
    }
    this.moonfireHits += 1;
  }

  onCast(event: CastEvent) {
    this.moonfireCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`You hit ${this.moonfireHits} times with ${this.moonfireCasts} casts.`}
      >
        <BoringSpellValueText spell={SPELLS.TWIN_MOONS_TALENT}>
          <>
            ${formatPercentage(this.percentTwoHits)} % <small>double hits</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwinMoons;
