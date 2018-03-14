import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import QuickShot from 'Parser/Hunter/Marksmanship/Modules/Traits/QuickShot';

class Abilities extends CoreAbilities {
  static dependencies = {
    ...CoreAbilities.dependencies,
    quickShot: QuickShot,
  };

  spellbook() {
    return [
      {
        spell: SPELLS.WINDBURST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          extraSuggestion: (
            <Wrapper>
              You should cast it whenever you cannot fit another <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> in your current <SpellLink id={SPELLS.VULNERABLE.id} icon /> window, which will generally almost always translate into almost on cooldown. It is your best <SpellLink id={SPELLS.VULNERABLE.id} icon /> generator, as it allows extra globals to be cast inside the window, allowing you to cast <SpellLink id={SPELLS.WINDBURST.id} icon /> at almost no focus.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.AIMED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ARCANE_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MULTISHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MARKED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLACK_ARROW_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.BLACK_ARROW_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <Wrapper>
              <SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} icon /> should be used on cooldown, and you should aim to hit it in the center of the mobs, as that will be where it does the most dmg.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: this.combatants.selected.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <Wrapper>
              You should aim to cast <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> on cooldown generally, and the last usage should be as early in the execute window (sub-20%) as possible, to allow for stacking of <SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon /> as fast as possible. This can mean delaying it for up to 20-30 seconds sometimes which can lower your cast-efficiency, even though you're playing optimally.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.BARRAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        enabled: this.combatants.selected.hasTalent(SPELLS.BARRAGE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <Wrapper>
              <SpellLink id={SPELLS.BARRAGE_TALENT.id} icon /> should generally be used on cooldown unless it needs to be saved for upcoming burst DPS requirement. It is however not worth using this on single-target at all, in which case you would be better off using either <SpellLink id={SPELLS.VOLLEY_TALENT.id} icon /> for stacked AoE or <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> for Single-target.
            </Wrapper>
          ),
        },
      },
      {
        spell: [SPELLS.SIDEWINDERS_TALENT, SPELLS.SIDEWINDERS_CAST],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.PIERCING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        enabled: this.combatants.selected.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <Wrapper>
              This should be used on cooldown, with 100 focus and while <SpellLink id={SPELLS.VULNERABLE.id} icon /> is on your target. If possible without delaying either, you should try to combine it with <SpellLink id={SPELLS.TRUESHOT.id} icon />.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.SENTINEL_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: this.combatants.selected.hasTalent(SPELLS.SENTINEL_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.TRUESHOT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180 - this.quickShot.traitCooldownReduction,
        isOnGCD: false,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.ARCANE_TORRENT_FOCUS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        isOnGCD: false,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        isOnGCD: false,
      },
      { //Marking as a defensive because of the damage reduction trait associated with it
        spell: SPELLS.DISENGAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 20,
        isOnGCD: false,
      },
      {
        spell: SPELLS.BURSTING_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CONCUSSIVE_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 5,
        isOnGCD: true,
      },
      {
        spell: SPELLS.COUNTER_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        isOnGCD: false,
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: false,
      },
      {
        spell: SPELLS.BINDING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: false,

      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id) ? 180 - (180 * 0.35) : 180,
        isOnGCD: false,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id) ? 180 - (180 * 0.35) : 180,
        isOnGCD: false,
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLARE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
