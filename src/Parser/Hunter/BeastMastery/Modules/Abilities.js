import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ITEMS from 'common/ITEMS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <React.Fragment>
              <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> should be cast on cooldown as its cooldown is quickly reset again through <SpellLink id={SPELLS.BARBED_SHOT.id} />. You want to start each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> window with as much focus as possible.
            </React.Fragment>
          ),
        },
      },
      {
        spell: SPELLS.KILL_COMMAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.COBRA_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DIRE_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id),
        gcd: {
          base: 1500,
        },
        cooldown: 15,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BARBED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        /* -- Commenting out the cooldown of this spell since there is no current way of tracking the resets on it properly
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },*/
      },
      {
        spell: SPELLS.MULTISHOT_BM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <React.Fragment>
              You should be casting <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT.id} /> on cooldown unless <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> has less than 30 seconds remaining on CD, in which case you can delay it slightly to line them up. It will dynamically update its damage to reflect damage increases such as <SpellLink id={SPELLS.BESTIAL_WRATH.id} />.
            </React.Fragment>
          ),
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_WILD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id) ? 120 - (120 * 0.35) : 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <React.Fragment>
              <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> should always be cast in conjunction with <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> to maximize the potency of these increased damage windows.
            </React.Fragment>
          ),
        },
      },
      {
        spell: SPELLS.BARRAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.STAMPEDE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.STAMPEDE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SPITTING_COBRA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CHIMAERA_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.SURVIVAL_OF_THE_FITTEST,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: SPELLS.PRIMAL_RAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 360,
        gcd: null,
      },

      {
        spell: SPELLS.MASTERS_CALL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: SPELLS.DISENGAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: null,
      },
      {
        spell: SPELLS.CONCUSSIVE_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.COUNTER_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        gcd: null,
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.INTIMIDATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BINDING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id) ? 180 - (180 * 0.35) : 180,
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => {
          const hasPathfinder = combatant.traitsBySpellId[SPELLS.PATHFINDER_TRAIT.id];
          const cooldownAfterPathFinder = hasPathfinder ? 120 : 180;
          const hasCallOfTheWild = combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterPathFinder * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        gcd: null,
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },

      /**
       * Racials until we find a better solution
       */
      {
        spell: SPELLS.ARCANE_TORRENT_FOCUS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BERSERKING,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [SPELLS.BLOOD_FURY_PHYSICAL, SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL, SPELLS.BLOOD_FURY_SPELL],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;
