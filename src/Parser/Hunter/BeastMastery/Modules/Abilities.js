import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      {
        spell: SPELLS.TITANS_THUNDER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        isOnGCD: false,
        enabled: this.combatants.selected.traitsBySpellId[SPELLS.TITANS_THUNDER.id],
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <Wrapper>
              <SpellLink id={SPELLS.TITANS_THUNDER.id} /> should always be cast when you have <SpellLink id={SPELLS.DIRE_BEAST_BUFF.id} /> buff up, try to cast it right after using a <SpellLink id={SPELLS.DIRE_BEAST.id} /> for maximum efficiency. If you have <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} /> talented, you should cast <SpellLink id={SPELLS.TITANS_THUNDER.id} /> within <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> so long as you can get off a <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} /> cast with it while <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is still up.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        isOnGCD: false,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
          extraSuggestion: (
            <Wrapper>
              <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> should be cast on cooldown as its cooldown is quickly reset again through <SpellLink id={SPELLS.DIRE_BEAST.id} />. You want to start each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> window with as much focus as possible.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.KILL_COMMAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.COBRA_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DIRE_BEAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.DIRE_FRENZY_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.MULTISHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: this.combatants.selected.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <Wrapper>
              You should be casting <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> on cooldown unless <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> has less than 30 seconds remaining on CD, in which case you can delay it slightly to line them up. It will dynamically update its damage to reflect damage increases such as <SpellLink id={SPELLS.BESTIAL_WRATH.id} />.
            </Wrapper>
          ),
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_WILD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id) ? 120 - (120 * 0.35) : 120,
        isOnGCD: false,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <Wrapper>
              <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> should always be cast in conjunction with <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> to maximize the potency of these increased damage windows.
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
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.STAMPEDE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 180,
        enabled: this.combatants.selected.hasTalent(SPELLS.STAMPEDE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CHIMAERA_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: this.combatants.selected.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        isOnGCD: false,
      },
      {
        spell: SPELLS.DISENGAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        isOnGCD: false,
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
        spell: SPELLS.WYVERN_STING_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: this.combatants.selected.hasTalent(SPELLS.WYVERN_STING_TALENT.id),
        cooldown: 45,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INTIMIDATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: this.combatants.selected.hasTalent(SPELLS.INTIMIDATION_TALENT.id),
        cooldown: 60,
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
        cooldown: () => {
          const hasPathfinder = this.combatants.selected.traitsBySpellId[SPELLS.PATHFINDER_TRAIT.id];
          const cooldownAfterPathFinder = hasPathfinder ? 120 : 180;
          const hasCallOfTheWild = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterPathFinder * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
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
    ];
  }
}

export default Abilities;
