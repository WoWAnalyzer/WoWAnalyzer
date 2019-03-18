import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import SoulShardTracker from 'parser/warlock/demonology/modules/soulshards/SoulShardTracker';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const DEMONFIRE_SP_COEFFICIENT = 0.325;
const debug = false;

class BalefulInvocation extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    soulShardTracker: SoulShardTracker,
  };

  bonus = 0;
  damage = 0;
  snapshottedIntellect = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BALEFUL_INVOCATION.id);
    if (!this.active) {
      return;
    }

    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.BALEFUL_INVOCATION.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.BALEFUL_INVOCATION.id, rank);
        debug && this.log(`Rank ${rank}, damage ${damage}`);
        return total + damage;
      }, 0);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT), this.onTyrantSummon);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DEMONIC_TYRANT_DAMAGE), this.onTyrantDamage);
  }

  onTyrantSummon() {
    // Demonic Tyrant snapshots player's Intellect on summon with 1:1 ratio, so we're basically using our own Intellect values
    this.snapshottedIntellect = this.statTracker.currentIntellectRating;
  }

  onTyrantDamage(event) {
    const [ damage ] = calculateBonusAzeriteDamage(event, [this.bonus], DEMONFIRE_SP_COEFFICIENT, this.snapshottedIntellect);
    debug && this.log(`Bonus Demonfire damage: ${damage}`);
    this.damage += damage;
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.BALEFUL_INVOCATION_ENERGIZE.id);
    const wasted = this.soulShardTracker.getWastedBySpell(SPELLS.BALEFUL_INVOCATION_ENERGIZE.id);
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={(
          <>
            Bonus Demonfire damage: {formatThousands(this.damage)}<br />
            You gained {generated} Soul Shards and wasted {wasted} Soul Shards with this trait.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BALEFUL_INVOCATION}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default BalefulInvocation;
