import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * Erupt a burst of fiery damage from all targets affected by your Flame Shock,
 * dealing (25% of Attack power) Fire damage to up to 6 targets within 8 yds of
 * your Flame Shock targets.
 *
 * Example Log:
 */
class FireNova extends Analyzer {
  protected casts: number = 0;
  protected hits: number = 0;
  protected fireNovaDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.FIRE_NOVA_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.FIRE_NOVA_TALENT),
      this.onFireNovaCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.FIRE_NOVA_DAMAGE),
      this.onFireNovaDamage,
    );
  }

  onFireNovaCast() {
    this.casts += 1;
  }

  onFireNovaDamage(event: DamageEvent) {
    this.hits += 1;
    this.fireNovaDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.FIRE_NOVA_TALENT}>
          <>
            <ItemDamageDone amount={this.fireNovaDamage} /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FireNova;
