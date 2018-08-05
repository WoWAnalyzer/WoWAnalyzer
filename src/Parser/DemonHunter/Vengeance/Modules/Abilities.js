import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.IMMOLATION_AURA,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: <React.Fragment>This is a great Pain filler spell. Try to always cast it on cooldown, specially when using <ItemLink id={ITEMS.KIREL_NARAK.id} /> legendary to trigger it's passive and/or using the <SpellLink id={SPELLS.FALLOUT_TALENT.id} /> talent in order to maximize your <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generation.</React.Fragment>,
        },
      },
      {
        spell: [combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) ? SPELLS.FRACTURE_TALENT : SPELLS.SHEAR],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) ? haste => 4.5 / (1 + haste) : 0,
        charges: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id),
          recommendedEfficiency: 0.90,
        },
        gcd: {
          base: 1500,
        },
      },

      // Defensive / Healing
      {
        spell: SPELLS.SOUL_CLEAVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.METAMORPHOSIS_TANK,
        buffSpellId: SPELLS.METAMORPHOSIS_TANK.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
        },
      },
      {
        spell: SPELLS.FIERY_BRAND,
        buffSpellId: SPELLS.FIERY_BRAND_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: <React.Fragment>Powerful CD. Use it during high damage moments.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.DEMON_SPIKES,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        /* Removing Demon Spikes cooldown as the Feed the Demon talent breaks it when selected
         * Feed the Demon reduces the cooldown of Demon Spikes by 0.5s for each soul fragment consumed when on CD
         * So, while I can't figure out a way to track this CD, I'm removing it from cast effiency to not break things or do wrong suggestions
        */
        cooldown: !combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) ? haste => 20 / (1 + haste) : null,
        charges: combatant.hasLegs(ITEMS.OBLIVIONS_EMBRACE.id) ? 3 : 2,
      },

      // Talents
      {
        spell: SPELLS.SIGIL_OF_CHAINS_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SIGIL_OF_CHAINS_TALENT.id),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRIT_BOMB_TALENT,
        buffSpellId: SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOUL_BARRIER_TALENT,
        buffSpellId: SPELLS.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80,
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <React.Fragment>This is a great Pain generator spell. </React.Fragment>,
        },
      },
      {
        spell: SPELLS.FEL_DEVASTATION_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_DEVASTATION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80,
          extraSuggestion: <React.Fragment>This is a great healing and AoE damage burst spell. The only moment you can delay it's cast is if your <SpellLink id={SPELLS.FIERY_BRAND.id} /> (with the <SpellLink id={SPELLS.CHARRED_FLESH_TALENT.id} /> talent) is almost available. </React.Fragment>,
        },
      },

      // Sigils
      {
        spell: [SPELLS.SIGIL_OF_SILENCE_CONCENTRATED,SPELLS.SIGIL_OF_SILENCE_QUICKENED],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.SIGIL_OF_MISERY_CONCENTRATED,SPELLS.SIGIL_OF_MISERY_QUICKENED],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.SIGIL_OF_FLAME_CONCENTRATED,SPELLS.SIGIL_OF_FLAME_QUICKENED],
        buffSpellId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: combatant.hasTalent(SPELLS.FLAME_CRASH_TALENT.id)?<React.Fragment>Line this up with <SpellLink id={SPELLS.INFERNAL_STRIKE.id} /> to double stack <SpellLink id={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} /> because of the <SpellLink id={SPELLS.FLAME_CRASH_TALENT.id} /> talent.</React.Fragment>:`Cast on cooldown for a dps increase.`,
        },
      },

      // Misc
      {
        spell: SPELLS.INFERNAL_STRIKE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.ABYSSAL_STRIKE_TALENT.id) ? 12 : 20,
        charges: 2,
      },

      {
        spell: SPELLS.IMPRISON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TORMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.CONSUME_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
      },
      {
        spell: SPELLS.Disrupt,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.THROW_GLAIVE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: haste => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
