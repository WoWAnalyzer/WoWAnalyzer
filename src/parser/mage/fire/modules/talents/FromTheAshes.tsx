import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { FIRE_DIRECT_DAMAGE_SPELLS, PHOENIX_FLAMES_MAX_CHARGES } from 'parser/mage/shared/constants';

const MS_REDUCTION_PER_STACK = 1000;

class FromTheAshes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  cooldownReduction: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROM_THE_ASHES_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS), this.onCritDamage);
  }

  //Look for crit damage events to reduce the cooldown on Kindling
  onCritDamage(event: DamageEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.PHOENIX_FLAMES.id) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const chargesOnCD = PHOENIX_FLAMES_MAX_CHARGES - this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES.id);
    this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.PHOENIX_FLAMES, MS_REDUCTION_PER_STACK * chargesOnCD);
  }

  get cooldownReductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.FROM_THE_ASHES_TALENT}>
          <>
            {formatNumber(this.cooldownReductionSeconds)}s <small>Phoenix Flames Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FromTheAshes;
