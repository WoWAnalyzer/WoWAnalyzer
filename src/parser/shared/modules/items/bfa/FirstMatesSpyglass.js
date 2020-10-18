import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import Abilities from 'parser/core/modules/Abilities';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import UptimeIcon from 'interface/icons/Uptime';
import CritIcon from 'interface/icons/CriticalStrike';
import { formatPercentage } from 'common/format';
import Events from 'parser/core/Events';

/**
 * First Mate's Spyglass -
 * Use: Increase your Critical Strike by 768 for 15 sec. (2 Min Cooldown)
 *
 * Test Log: https://www.warcraftlogs.com/reports/Q273n64m9JGNLqBh#fight=4&type=damage-done&source=17
 */
class FirstMatesSpyglass extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  casts = 0;
  timesHit = 0;
  timesCrit = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(
      ITEMS.FIRST_MATES_SPYGLASS.id,
    );
    if (this.active) {
      this.abilities.add({
        spell: SPELLS.SPYGLASS_SIGHT,
        name: ITEMS.FIRST_MATES_SPYGLASS.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPYGLASS_SIGHT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onCast(event) {
    this.casts += 1;
  }

  onDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPYGLASS_SIGHT.id)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      this.timesHit += 1;
    } else {
    this.timesHit += 1;
    this.timesCrit += 1;
    }
  }

  onHeal(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPYGLASS_SIGHT.id)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      this.timesHit += 1;
      } else {
      this.timesHit += 1;
      this.timesCrit += 1;
    }
  }

  get totalBuffUptime() {
      return this.selectedCombatant.getBuffUptime(SPELLS.SPYGLASS_SIGHT.id) / this.owner.fightDuration;
  }

  get critPercentage() {
    return this.timesCrit / this.timesHit;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={`Used ${this.casts} times`}
      >
        <BoringItemValueText item={ITEMS.FIRST_MATES_SPYGLASS}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small><br />
          <CritIcon /> {formatPercentage(this.critPercentage,0)}% <small>critical hits during buff</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default FirstMatesSpyglass;
