import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import React from 'react';

const azeriteTraitStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.REVOLVING_BLADES.id, rank, -1);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/**
 * Revolving Blades  Azerite Power
 * Requires Demon Hunter (Havoc)
 * Blade Dance deals 1664 additional damage, and the cost of your next
 * Blade Dance is reduced by 3 Fury for each enemy struck by the final slash.
 *
 * Example Report: /report/TYfHayb1nxkDtKVJ/9-Heroic+Queen+Azshara+-+Kill+(7:23)/Flourishing/statistics
 */
class RevolvingBlades extends Analyzer {

  damagePerRevolvingBlades = 0;
  totalBladeDanceCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.REVOLVING_BLADES.id);
    if (!this.active) {
      return;
    }

    const { damage } = azeriteTraitStats(this.selectedCombatant.traitsBySpellId[SPELLS.REVOLVING_BLADES.id]);
    this.damagePerRevolvingBlades = damage;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_SWEEP), this.onBladeDanceCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADE_DANCE), this.onBladeDanceCast);
  }

  onBladeDanceCast(event) {
    this.totalBladeDanceCasts += 1;
  }

  statistic() {
    const totalDamage = this.totalBladeDanceCasts * this.damagePerRevolvingBlades;
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(totalDamage);
    const dps = totalDamage / this.owner.fightDuration * 1000;
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            <SpellLink id={SPELLS.REVOLVING_BLADES.id} /> is a flat damage increase for every <SpellLink id={SPELLS.BLADE_DANCE.id} /><br />
            and <SpellLink id={SPELLS.DEATH_SWEEP.id} /> you cast.<br />
            <br />
            {formatNumber(this.damagePerRevolvingBlades)} damage per <SpellLink id={SPELLS.BLADE_DANCE.id} />/<SpellLink id={SPELLS.DEATH_SWEEP.id} /> cast.<br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.REVOLVING_BLADES}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          /> {formatNumber(dps)} DPS <small>{formatPercentage(damageThroughputPercent)} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default RevolvingBlades;
