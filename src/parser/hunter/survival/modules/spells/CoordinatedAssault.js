import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellUsable from 'parser/core/modules/SpellUsable';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * You and your pet attack as one, increasing all damage you both deal by
 * 20% for 20 sec. While Coordinated Assault is active, Kill Command's
 * chance to reset is increased by 25%.
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 */

const CA_DMG_MODIFIER = 0.2;

class CoordinatedAssault extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  casts = 0;
  playerDamage = 0;
  petDamage = 0;

  on_byPlayerPet_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.petDamage += calculateEffectiveDamage(event, CA_DMG_MODIFIER);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COORDINATED_ASSAULT.id) {
      this.casts += 1;
    }
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.COORDINATED_ASSAULT.id, this.owner.fight.start_time);
    }
    this.playerDamage += calculateEffectiveDamage(event, CA_DMG_MODIFIER);
  }

  get totalDamage() {
    return this.playerDamage + this.petDamage;
  }
  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(17)}
        icon={<SpellIcon id={SPELLS.COORDINATED_ASSAULT.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Coordinated Assault uptime"
        tooltip={`Over the course of the encounter you had Coordinated Assault up for a total of ${(this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / 1000).toFixed(1)} seconds.`}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />}
        value={<ItemDamageDone amount={this.totalDamage} />}
        valueTooltip={`Total damage breakdown:
                      <ul>
                      <li>Player damage: ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.playerDamage))}% / ${formatNumber(this.playerDamage / (this.owner.fightDuration / 1000))} DPS</li>
                      <li>Pet damage: ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.petDamage))}% / ${formatNumber(this.petDamage / (this.owner.fightDuration / 1000))} DPS</li>
                      </ul>`}
      />
    );
  }
}

export default CoordinatedAssault;
