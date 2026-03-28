import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
/**
 * Algeth''ar Puzzle Box ΓÇö on-use Mastery trinket (3 min CD).
 * BiS on-use for MM Hunter. Should be used before Trueshot (like the opener).
 * Flags casts that occur outside of a Trueshot window.
 */
export default class AlgetharPuzzleBox extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  casts = 0;
  castsInsideTrueshot = 0;
  castsOutsideTrueshot = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ALGETHAR_PUZZLE_BOX.id);
    if (!this.active) {
      return;
    }
    this.deps.abilities.add({
      spell: SPELLS.ALGETHAR_PUZZLE.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 180,
      gcd: null,
    });
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ALGETHAR_PUZZLE),
      this.onCast,
    );
  }
  onCast(event: CastEvent) {
    this.casts += 1;
    const inTrueshot = this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id);
    // Also check if Trueshot is about to be cast (within 3s pre-cast window)
    // We flag it as bad only if clearly not aligned with Trueshot
    if (inTrueshot) {
      this.castsInsideTrueshot += 1;
    } else {
      this.castsOutsideTrueshot += 1;
      if (this.casts > 1) {
        // Don't flag opener pre-cast since it''s cast before Trueshot by design
        addInefficientCastReason(
          event,
          "Algeth'ar Puzzle Box used outside of Trueshot. Use it just before Trueshot for maximum value.",
        );
      }
    }
  }
}
