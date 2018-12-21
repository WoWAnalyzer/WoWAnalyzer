import React from 'react';
import SpellLink from 'common/SpellLink';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';

const KILLER_INSTINCT_TRESHOLD = 0.35;
const KILLER_INSTINCT_CONTRIBUTION = 0.5;

/**
 * Kill Command deals 50% increased damage against enemies below 35% health.
 *
 * Example log: https://www.warcraftlogs.com/reports/CznQpdmRFBJkjg4w/#fight=40&source=16&type=damage-done
 */
class KillerInstinct extends Analyzer {
  casts = 0;
  castsWithExecute = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KILLER_INSTINCT_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_DAMAGE_BM.id) {
      return;
    }

    this.casts++;
    const enemyHealthPercent = (event.hitPoints / event.maxHitPoints);
    if (enemyHealthPercent <= KILLER_INSTINCT_TRESHOLD) {
      this.castsWithExecute++;

      const traitDamage = calculateEffectiveDamage(event, KILLER_INSTINCT_CONTRIBUTION);
      this.damage += traitDamage;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.KILLER_INSTINCT_TALENT.id}
        value={<>{formatNumber(this.castsWithExecute)} casts at &lt;35% health</>}
        tooltip={`You cast a total of ${this.casts} Kill Commands, of which ${this.castsWithExecute} were on enemies with less than 35% of their health remaining.
                  These ${this.castsWithExecute} casts provided you a total of ${formatNumber(this.damage)} extra damage throughout the fight.`}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.KILLER_INSTINCT_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default KillerInstinct;
