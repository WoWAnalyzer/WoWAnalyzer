import React from 'react';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';


const KILLER_INSTINCT_TRESHOLD = 0.35;
const KILLER_INSTINCT_CONTRIBUTION = 0.5;

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
    if (spellId !== SPELLS.KILL_COMMAND_PET.id) {
      return;
    }

    this.casts++;
    const enemyHealthPercent = (event.hitPoints / event.maxHitPoints);
    if (enemyHealthPercent <= KILLER_INSTINCT_TRESHOLD) {
      this.castsWithExecute++;

      const totalDamage = (event.amount + event.absorbed);
      const baseDamage = totalDamage / (1 + KILLER_INSTINCT_CONTRIBUTION);
      const traitDamage = totalDamage - baseDamage;

      this.damage += traitDamage;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.KILLER_INSTINCT_TALENT.id} />}
        value={<>{formatNumber(this.castsWithExecute)} casts at &lt;35% health</>}
        label="Killer Instinct"
        tooltip={`You've casted a total of ${this.casts} Kill Commands, of which ${this.castsWithExecute} were on enemies with less than 35% of their health remaining.
                  These ${this.castsWithExecute} casts have provided you a total of ${formatNumber(this.damage)} extra damage throughout the fight.`}
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
