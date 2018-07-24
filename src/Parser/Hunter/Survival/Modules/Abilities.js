import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.MONGOOSE_BITE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id),
        gcd: {
          base: 1500,
        },
        /* -- Commenting out the cooldown of this spell since there is no current way of tracking the resets on it properly
        cooldown: haste => 12 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },*/
      },
      {
        spell: SPELLS.CARVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
      },
      {
        spell: SPELLS.EXPLOSIVE_TRAP_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.traitsBySpellId[SPELLS.HUNTERS_GUILE_TRAIT.id] ? 30 * 0.8 : 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .70,
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
          recommendedEfficiency: .95,
        },
      },
      {
        spell: SPELLS.STEEL_TRAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.traitsBySpellId[SPELLS.HUNTERS_GUILE_TRAIT.id] ? 60 * 0.8 : 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.BUTCHERY_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: haste => 12 / (1 + haste),
        charges: 3,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SPITTING_COBRA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: <React.Fragment>Although you want to be casting Spitting Cobra as much as possible, you also want to be gaining as much as possible from each cast, and since <SpellLink id={SPELLS.SPITTING_COBRA_TALENT.id} icon /> scales extremely well with haste, it can be worth delaying usage to line it up with a haste buff such as <SpellLink id={SPELLS.HEROISM.id} icon /> or a <ItemLink id={ITEMS.SEPHUZS_SECRET.id} icon /> proc.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.RAPTOR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HATCHET_TOSS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LACERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_EAGLE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: () => {
          const hasEmbrace = combatant.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 90 - (90 * 0.2) : 90;
          const hasCallOfTheWild = combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => {
          const hasEmbrace = combatant.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 180 - (180 * 0.2) : 180;
          const hasCallOfTheWild = combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: () => {
          const hasEmbrace = combatant.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 180 - (180 * 0.2) : 180;
          const hasCallOfTheWild = combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        gcd: null,
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.HARPOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
      },
      {
        spell: SPELLS.MUZZLE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.DISENGAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: null,
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.traitsBySpellId[SPELLS.HUNTERS_GUILE_TRAIT.id] ? 30 * 0.8 : 30,
        enabled: !combatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.traitsBySpellId[SPELLS.HUNTERS_GUILE_TRAIT.id] ? 30 * 0.8 : 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLARE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WING_CLIP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      
    ];
  }
}

export default Abilities;
