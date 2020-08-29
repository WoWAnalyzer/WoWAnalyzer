import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { COMBUST_REDUCTION_SPELLS, KINDLING_REDUCTION_MS } from '../../constants';

class Kindling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  cooldownReduction = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KINDLING_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(COMBUST_REDUCTION_SPELLS), this.onCritDamage);
  }

  //Look for crit damage events to reduce the cooldown on Kindling
  onCritDamage(event: DamageEvent) {
    const combustionOnCD = this.spellUsable.isOnCooldown(SPELLS.COMBUSTION.id);
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (combustionOnCD) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.COMBUSTION.id, (KINDLING_REDUCTION_MS));
    }
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
        <BoringSpellValueText spell={SPELLS.KINDLING_TALENT}>
          <>
            {formatNumber(this.cooldownReductionSeconds)}s <small>Combustion Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Kindling;
