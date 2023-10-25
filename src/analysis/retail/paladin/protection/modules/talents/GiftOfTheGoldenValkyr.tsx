import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

export const BASE_REDUCTION_TIME = 500; // ms, per talent point, per target hit
const SECOND = 1000;
/**
 * Avenger's Shield reduces the cooldown of Guardian of Ancient Kings for 0.5seconds per target hit per talent point.
 */
class GiftOfTheGoldenValkyr extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  guardianOfAncientKingsReduced: number = 0;
  guardianOfAncientKingsWasted: number = 0;
  reductionTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.onHit,
    );
    this.reductionTime = this._REDUCTION_TIME(this.selectedCombatant);
  }

  _REDUCTION_TIME(combatant: Combatant): number {
    return combatant.getTalentRank(TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT) * BASE_REDUCTION_TIME;
  }

  onHit(event: DamageEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id)) {
      const reduction = this.spellUsable.reduceCooldown(
        TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
        this.reductionTime,
      );
      this.guardianOfAncientKingsReduced += reduction;
      this.guardianOfAncientKingsWasted += this.reductionTime - reduction;
    } else {
      this.guardianOfAncientKingsWasted += this.reductionTime;
    }

    // Handles CooldownGraphSection in Guide
    this.spellUsable.reduceCooldown(
      TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
      this.reductionTime,
      event.timestamp,
    );
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT}>
          <SpellIcon spell={TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT} />{' '}
          {formatNumber(this.guardianOfAncientKingsReduced / SECOND)}s{' '}
          <small>
            CD Reduction ({formatNumber(this.guardianOfAncientKingsWasted / SECOND)}s wasted)
          </small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GiftOfTheGoldenValkyr;
