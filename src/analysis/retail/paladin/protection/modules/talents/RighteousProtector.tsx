import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

export const REDUCTION_TIME = 2000; // ms
const SECOND = 1000;

/**
 * Shield of the Righteous reduces the remaining cooldown on Avenging Wrath and Guardian of Ancient Kings by 2 seconds.
 */
class RighteousProtector extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  // Guardian Of Ancient Kings is 1, Guardian of Ancient Queens is 2
  guardianOfAncientKingsVariant: number = 0;
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
      this.onCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WORD_OF_GLORY), this.onCast);
  }

  onCast(event: CastEvent) {
    const hasSentinel = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT);
    const hasGuardianOfAncientKingsQueen = this.guardianOfAncientKingsVariant === 2;

    if (hasSentinel && this.spellUsable.isOnCooldown(SPELLS.SENTINEL.id)) {
      this.spellUsable.reduceCooldown(SPELLS.SENTINEL.id, REDUCTION_TIME, event.timestamp);
    } else if (!hasSentinel && this.spellUsable.isOnCooldown(SPELLS.AVENGING_WRATH.id)) {
      this.spellUsable.reduceCooldown(SPELLS.AVENGING_WRATH.id, REDUCTION_TIME, event.timestamp);
    }

    if (
      hasGuardianOfAncientKingsQueen &&
      this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id)
    ) {
      this.spellUsable.reduceCooldown(
        SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        REDUCTION_TIME,
        event.timestamp,
      );
    } else if (
      !hasGuardianOfAncientKingsQueen &&
      this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id)
    ) {
      this.spellUsable.reduceCooldown(
        TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
        REDUCTION_TIME,
        event.timestamp,
      );
    }
    //Handle Avenging Wrath/Sentinel Statistics
    if (
      this.spellUsable.isOnCooldown(SPELLS.AVENGING_WRATH.id) ||
      this.spellUsable.isOnCooldown(SPELLS.SENTINEL.id)
    ) {
      this.avengingWrathReduced += REDUCTION_TIME;
    } else {
      this.avengingWrathReductionWasted += REDUCTION_TIME;
    }
    //Handle Guardian of Ancient Kings Statistics
    if (
      this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id) ||
      this.spellUsable.isOnCooldown(TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id)
    ) {
      this.guardianOfAncientKingsReduced += REDUCTION_TIME;
    } else {
      this.guardianOfAncientKingsWasted += REDUCTION_TIME;
    }
  }

  avengingWrathReduction(combatant: Combatant): number {
    if (combatant.hasTalent(TALENTS.SENTINEL_TALENT)) {
      return this.spellUsable.reduceCooldown(SPELLS.SENTINEL.id, REDUCTION_TIME);
    } else {
      return this.spellUsable.reduceCooldown(SPELLS.AVENGING_WRATH.id, REDUCTION_TIME);
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
          <small>
            <br />
            Guardian of Ancient kings version: ({this.guardianOfAncientKingsVariant})
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RighteousProtector;
