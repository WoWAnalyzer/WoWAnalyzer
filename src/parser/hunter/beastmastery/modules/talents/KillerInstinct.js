import React from 'react';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const KILLER_INSTINCT_TRESHOLD = 0.35;
const KILLER_INSTINCT_CONTRIBUTION = 0.5;

/**
 * Kill Command deals 50% increased damage against enemies below 35% health.
 *
 * Example log: https://www.warcraftlogs.com/reports/DFZVfmhkj9bYa6rn#fight=1&type=damage-done
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
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            You cast a total of {this.casts} Kill Commands, of which {this.castsWithExecute} were on enemies with less than 35% of their health remaining.
            These {this.castsWithExecute} casts provided you a total of {formatNumber(this.damage)} extra damage throughout the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.KILLER_INSTINCT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            {formatNumber(this.castsWithExecute)} <small>casts at &lt; 35% health</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  /**
   * @deprecated
   * @returns {*}
   */
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
