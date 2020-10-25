import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatNumber } from 'common/format';


const RISING_SUN_REDUCTION = 1000;
/**
 * Every time you cast rising sun kick it reduces revival's cooldown by 1 second and whenever you cast revival x% of that healing is done again as a hot over 10 seconds
 */
class RisingSunRevival extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    healingDone: HealingDone,
  };

  protected spellUsable!: SpellUsable;
  protected healingDone!: HealingDone;

  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;

  constructor(options: Options){
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.rskCast);
  }

  rskCast(event: CastEvent) {
    // Cooldown Reduction on Revival
      if (this.spellUsable.isOnCooldown(SPELLS.REVIVAL.id)) {
        this.cooldownReductionUsed += this.spellUsable.reduceCooldown(SPELLS.REVIVAL.id, RISING_SUN_REDUCTION);
      } else {
        this.cooldownReductionWasted += RISING_SUN_REDUCTION;
      }
  }

  statistic() {
    const healing = this.healingDone.byAbility(SPELLS.RISING_SUN_REVIVAL_HEAL.id).effective;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
        <>
          Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed/1000)} Seconds<br />
          Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted/1000)} Seconds
        </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RISING_SUN_REVIVAL}>
          <ItemHealingDone amount={healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RisingSunRevival;
