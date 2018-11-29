import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';


const simmeringRageDamage = traits => Object.values(traits).reduce((obj, rank) => {
  const [ damage ] = calculateAzeriteEffects(SPELLS.SIMMERING_RAGE.id, rank);
  obj.damage += damage;
  return damage;
  }, {
    damage: 0,
  });

class SimmeringRage extends Analyzer {
  rampage = [SPELLS.RAMPAGE_1.id, SPELLS.RAMPAGE_2.id, SPELLS.RAMPAGE_3.id, SPELLS.RAMPAGE_4.id];
  rampageDamage = 0;
  simmeringDamage = 0;
  damage = 0;
  rageGen = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.SIMMERING_RAGE.id);

    const damage = simmeringRageDamage(this.selectedCombatant.traitsBySpellId[SPELLS.SIMMERING_RAGE.id]);
    this.damage = damage;

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onPlayerEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

    onPlayerEnergize(event) {
      if (event.ability.guid === 278841) {
        this.rageGen += 1;
      }
    }

    onPlayerDamage(event) {
      if (!this.rampage.includes(event.ability.guid)) {
        return;
      }

      this.simmeringDamage += this.damage;
    }

    get dps() {
      return this.simmeringDamage / (this.owner.fightDuration / 1000);
    }

    get dpsPercentage() {
      return this.owner.getPercentageOfTotalDamageDone(this.simmeringDamage);
    }

    statistic() {
      return (
        <TraitStatisticBox
          trait={SPELLS.SIMMERING_RAGE.id}
          value={`${this.rageGen} rage generated`}
          tooltip={`Simmering Rage did <b>${formatThousands(this.simmeringDamage)}</b> damage, contributing to <b>${formatNumber(this.dps)} (${formatPercentage(this.dpsPercentage)}%)</b> of your DPS.`}
        />
        );
  }
}

export default SimmeringRage;