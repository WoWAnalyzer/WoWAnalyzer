import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatPercentage } from 'common/format';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Fire a shot that poisons your target, causing them to take (16.5% of Attack power) Nature damage instantly and an additional (99% of Attack power) Nature damage over 18 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GWwtNLVQD8adn6q9#fight=5&type=damage-done&source=18&ability=271788
 *
 * TODO: Add suggestion for early refreshes and such
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  protected enemies!: Enemies;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onDamage);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_TALENT.id) / this.owner.fightDuration;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SERPENT_STING_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentSting;
