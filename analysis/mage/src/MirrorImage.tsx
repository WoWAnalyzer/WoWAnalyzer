import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

const DAMAGE_REDUCTION = 0.2;

class MirrorImage extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  damageDuringMirrorImages = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MIRROR_IMAGE.id)) {
      return;
    }
    this.damageDuringMirrorImages += event.amount + (event.absorbed || 0);
  }

  get totalDamageReduction() {
    return (this.damageDuringMirrorImages / (1 - DAMAGE_REDUCTION)) * DAMAGE_REDUCTION;
  }

  get reductionPerCast() {
    return this.totalDamageReduction / this.abilityTracker.getAbility(SPELLS.MIRROR_IMAGE.id).casts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            This is the amount of damage that your Mirror Images prevented while they were active.
            Remember that Mirror Image is not a damage cooldown anymore and should solely be used as
            a defensive ability to help reduce incoming damage.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.MIRROR_IMAGE.id}>
          <>
            {formatNumber(this.totalDamageReduction)} <small> Damage Avoided</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MirrorImage;
