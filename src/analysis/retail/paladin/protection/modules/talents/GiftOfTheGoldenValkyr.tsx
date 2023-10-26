import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

export const BASE_REDUCTION_TIME = 1000; // ms, per talent point, per target hit
const SECOND = 1000;
/**
 * Avenger's Shield reduces the cooldown of Guardian of Ancient Kings for 0.5seconds per target hit per talent point.
 */
class GiftOfTheGoldenValkyr extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  // Guardian Of Ancient Kings is 1, Guardian of Ancient Queens is 2
  guardianOfAncientKingsVariant: number = 0;
  guardianOfAncientKingsReduced: number = 0;
  guardianOfAncientKingsWasted: number = 0;
  reductionTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GIFT_OF_THE_GOLDEN_VALKYR_TALENT);
    if (!this.active) {
      return;
    }
    //Figure out GoaK Variant
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ANCIENT_KINGS),
      (event: CastEvent) => (this.guardianOfAncientKingsVariant = 1),
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN),
      (event: CastEvent) => (this.guardianOfAncientKingsVariant = 2),
    );

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
    const hasGuardianOfAncientKingsQueen = this.guardianOfAncientKingsVariant === 2;

    if (
      hasGuardianOfAncientKingsQueen &&
      this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id)
    ) {
      this.guardianReduction(SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id);
      this.guardianOfAncientKingsReduced += this.reductionTime;
    } else if (
      !hasGuardianOfAncientKingsQueen &&
      this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id)
    ) {
      this.guardianReduction(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id);
      this.guardianOfAncientKingsReduced += this.reductionTime;
    }
    //Handle Guardian of Ancient Kings Statistics
    if (
      this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id) ||
      this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id)
    ) {
      this.guardianOfAncientKingsReduced += this.reductionTime;
    } else {
      this.guardianOfAncientKingsWasted += this.reductionTime;
    }
  }

  /**
   * The buff provided as part of Guardian of Ancient Kings has a different ID based on whether or
   * not the Guardian of Ancient Queens glyph is being used. Since we have no way of looking at the current
   * player's glyphs and `reduceCooldown` throws an error if you try to reduce the CD of a spell not on CD,
   * we use this slightly stupid way of reducing the player's GOAK CD
   */
  guardianReduction(spellId: number): number {
    try {
      return this.spellUsable.reduceCooldown(spellId, this.reductionTime);
    } catch (e) {
      return 0;
    }
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
