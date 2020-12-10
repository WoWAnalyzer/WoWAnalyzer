import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

const FORCEFUL_WINDS = {
  INCREASE_PER_STACK: .5,
};

/**
 * Windfury causes each successive Windfury attack within 15 sec to
 * increase the damage of Windfury by 50%, stacking up to 5 times.
 */
class ForcefulWinds extends Analyzer {
  protected damageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.FORCEFUL_WINDS_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.WINDFURY_ATTACK),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const buff: any = this.selectedCombatant.getBuff(SPELLS.FORCEFUL_WINDS_BUFF.id);
    if (!buff) {
      return;
    }
    const stacks = buff.stacks || 0;
    this.damageGained += calculateEffectiveDamage(
      event,
      stacks * FORCEFUL_WINDS.INCREASE_PER_STACK,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.FORCEFUL_WINDS_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ForcefulWinds;
