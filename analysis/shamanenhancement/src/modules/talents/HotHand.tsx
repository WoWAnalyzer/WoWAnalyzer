import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const HOT_HAND = {
  INCREASE: 1.0,
};

/**
 * Melee auto-attacks with Flametongue Weapon active have a 5% chance to
 * reduce the cooldown of Lava Lash by 75% and increase the damage of
 * Lava Lash by 100% for 8 sec.
 *
 * Example Log:
 *
 */
class HotHand extends Analyzer {

  protected buffedLavaLashDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.LAVA_LASH),
      this.onLavaLashDamage,
    );
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.buffedLavaLashDamage += calculateEffectiveDamage(event, HOT_HAND.INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.HOT_HAND_TALENT}>
          <>
            <ItemDamageDone amount={this.buffedLavaLashDamage} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotHand;
