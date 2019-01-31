import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellLink from 'common/SpellLink';

const MASTER_OF_THE_ELEMENTS = {
  INCREASE: 0.2,
  DURATION: 15000,
  WINDOW_DURATION: 300,
  AFFECTED_DAMAGE: [
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.ICEFURY_OVERLOAD.id,
    SPELLS.FROST_SHOCK.id,
    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.LIGHTNING_BOLT_OVERLOAD.id,
    SPELLS.CHAIN_LIGHTNING.id,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD.id,
    SPELLS.EARTH_SHOCK.id,
  ],
  AFFECTED_CASTS: [
    SPELLS.EARTHQUAKE.id,
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.FROST_SHOCK.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
    SPELLS.CHAIN_LIGHTNING.id,
    SPELLS.EARTH_SHOCK.id,
    SPELLS.LIGHTNING_BOLT.id,
  ],
  TALENTS: [
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  moteBuffedAbilities = {};
  moteActivationTimestamp = null;
  moteConsumptionTimestamp = null;
  damageGained = 0;
  buffsWasted = 0;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id);

    for (const key in MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS) {
      const spellid = MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS[key];
      if((this.selectedCombatant.hasTalent(spellid)) || (!MASTER_OF_THE_ELEMENTS.TALENTS.includes(spellid))) {

        this.moteBuffedAbilities[spellid] = 0;
      }
    }
  }

  on_byPlayer_cast(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id)) {
      return;
    }
    if (event.ability.guid === SPELLS.LAVA_BURST.id) {
      this.buffsWasted++;
      return;
    }

    const spellid = event.ability.guid;

    if (MASTER_OF_THE_ELEMENTS.AFFECTED_DAMAGE.includes(spellid)) {
      this.moteActivationTimestamp = event.timestamp;
    }
    if(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS.includes(spellid)) {
      this.moteBuffedAbilities[spellid]++;
    }
  }

  on_byPlayer_damage(event) {
    if (this.moteActivationTimestamp === null) {
      return;
    }

    if (event.timestamp > this.moteActivationTimestamp + MASTER_OF_THE_ELEMENTS.WINDOW_DURATION) {
      return;
    }
    const spellid = event.ability.guid;
    if (!MASTER_OF_THE_ELEMENTS.AFFECTED_DAMAGE.includes(spellid)) {
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, MASTER_OF_THE_ELEMENTS.INCREASE);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }



  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage, excluding EQ).`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Number of Buffed Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.moteBuffedAbilities).map((e) => (
              <tr key={e}>
                <th>{<SpellLink id={e} />}</th>
                <td>{this.moteBuffedAbilities[e]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>

    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL;
}

export default MasterOfTheElements;
