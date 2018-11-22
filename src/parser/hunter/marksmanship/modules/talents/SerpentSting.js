import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/P9G8VRYNTn3Xpv21#fight=8&type=damage-done
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_TALENT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_TALENT.id) / this.owner.fightDuration;
  }
  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SERPENT_STING_TALENT.id}
        position={STATISTIC_ORDER.CORE(22)}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Serpent Sting Uptime"
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.SERPENT_STING_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default SerpentSting;
