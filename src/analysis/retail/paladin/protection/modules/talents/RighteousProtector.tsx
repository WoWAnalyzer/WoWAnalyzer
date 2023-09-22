import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

export const REDUCTION_TIME = 1000; // ms
const SECOND = 1000;

/**
 * Shield of the Righteous reduces the remaining cooldown on Avenging Wrath and Guardian of Ancient Kings by 1 second.
 */
class RighteousProtector extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  guardianOfAncientKingsReduced: number = 0;
  guardianOfAncientKingsWasted: number = 0;
  avengingWrathReduced: number = 0;
  avengingWrathReductionWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.AVENGING_WRATH.id)) {
      const reduction = this.spellUsable.reduceCooldown(SPELLS.AVENGING_WRATH.id, REDUCTION_TIME);
      this.avengingWrathReduced += reduction;
      this.avengingWrathReductionWasted += REDUCTION_TIME - reduction;
    } else {
      this.avengingWrathReductionWasted += REDUCTION_TIME;
    }
    if (
      this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id) ||
      this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id)
    ) {
      const reduction = this.guardianReduction;
      this.guardianOfAncientKingsReduced += reduction;
      this.guardianOfAncientKingsWasted += REDUCTION_TIME - reduction;
    } else {
      this.guardianOfAncientKingsWasted += REDUCTION_TIME;
    }
  }

  /**
   * The buff provided as part of Guardian of Ancient Kings has a different ID based on whether or
   * not the Guardian of Ancient Queens glyph is being used. Since we have no way of looking at the current
   * player's glyphs and `reduceCooldown` throws an error if you try to reduce the CD of a spell not on CD,
   * we use this slightly stupid way of reducing the player's GOAK CD
   */
  get guardianReduction(): number {
    try {
      return this.spellUsable.reduceCooldown(
        TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
        REDUCTION_TIME,
      );
    } catch (e) {
      return this.spellUsable.reduceCooldown(
        SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        REDUCTION_TIME,
      );
    }
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.RIGHTEOUS_PROTECTOR_TALENT}>
          <SpellIcon spell={SPELLS.AVENGING_WRATH} />{' '}
          {formatNumber(this.avengingWrathReduced / SECOND)}s{' '}
          <small>
            CD Reduction ({formatNumber(this.avengingWrathReductionWasted / SECOND)}s wasted)
          </small>
          <br />
          <SpellIcon spell={TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT} />{' '}
          {formatNumber(this.guardianOfAncientKingsReduced / SECOND)}s{' '}
          <small>
            CD Reduction ({formatNumber(this.guardianOfAncientKingsWasted / SECOND)}s wasted)
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RighteousProtector;
