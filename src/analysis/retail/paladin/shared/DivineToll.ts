import TALENTS from 'common/TALENTS/paladin';
import SPECS from 'game/SPECS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

/**
 * Divine Toll – shared module for all Paladin specs.
 *
 * Registers the ability with a cooldown reduced by Quickened Invocation.
 * Divine Resonance is handled by a separate module
 */
class DivineToll extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT);
    if (!this.active) {
      return;
    }

    const specId = this.selectedCombatant.specId;
    const quickenedInvocationRank = this.selectedCombatant.getTalentRank(
      TALENTS.QUICKENED_INVOCATION_TALENT,
    );

    let cdReduction = 0;
    if (specId === SPECS.RETRIBUTION_PALADIN.id) {
      cdReduction = quickenedInvocationRank * 30;
    } else {
      // Protection / Holy
      cdReduction = quickenedInvocationRank * 15;
    }
    const cooldown = 60 - cdReduction;

    this.deps.abilities.add({
      spell: TALENTS.DIVINE_TOLL_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown,
      gcd: { base: 1500 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
  }
}

export default DivineToll;
