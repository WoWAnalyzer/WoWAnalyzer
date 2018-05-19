import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.IMMOLATION_AURA,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: <span>This is a great Pain filler spell. Try to always cast it on cooldown, specially when using <ItemLink id={ITEMS.KIREL_NARAK.id} /> legendary to trigger it's passive and/or using the <SpellLink id={SPELLS.FALLOUT_TALENT.id} /> talent in order to maximize your <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generation. </span>,
        },
      },
      {
        spell: SPELLS.DEMON_SPIKES,
        buffSpellId: SPELLS.DEMON_SPIKES_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: haste => 15 / (1 + haste),
        charges: combatant.hasTalent(SPELLS.RAZOR_SPIKES_TALENT.id) ? 3 : 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: <span>This is a great physical reduction spell and it also provides a great physical damage increase in your case, giving your <SpellLink id={SPELLS.RAZOR_SPIKES_TALENT.id} /> talent choice. Try to always cast it on cooldown. </span>,
        },
      },
      {
        spell: SPELLS.SOUL_CARVER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 40,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>This is your cooldown <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generator spell and it does the higher damage / casting time of all your abilities. The only moment you can delay it's cast is if you already have 5 unused <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> or if you are waiting for a damage burst combo with <SpellLink id={SPELLS.FIERY_BRAND.id} /> (with the <SpellLink id={SPELLS.FIERY_DEMISE.id} /> artifact trait). </span>,
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>This is a great Pain generator spell and it does a single target DPS increase by just 30 Pain per cast. The only moment you can delay it's cast is if you already have 5 unused <SpellLink id={SPELLS.SOUL_FRAGMENT.id} />. </span>,
        },
      },
      {
        spell: SPELLS.FEL_ERUPTION_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>This is a great Chaos burst damage spell and it does a huge single target DPS increase by just 10 Pain per cast. Should definitively be used as soon as it gets available. </span>,
        },
      },
      {
        spell: SPELLS.FEL_DEVASTATION_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_DEVASTATION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          extraSuggestion: <span>This is a great healing and AoE damage burst spell. It costs just 30 Pain and should be definitively used as soon as it gets available. The only moment you can delay it's cast is if your <SpellLink id={SPELLS.FIERY_BRAND.id} /> (with the <SpellLink id={SPELLS.FIERY_DEMISE.id} /> artifact trait) is almost available. </span>,
        },
      },
      {
        spell: SPELLS.SOUL_BARRIER_TALENT,
        buffSpellId: SPELLS.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: <span>This usage can be improved with <SpellLink id={SPELLS.SOUL_CARVER.id} /> for maximum efficiency. Also, this can be used more to soak burst instant damage when used with <SpellLink id={SPELLS.DEMON_SPIKES.id} /> for physical damage or with <SpellLink id={SPELLS.EMPOWER_WARDS.id} /> for magical damage. </span>,
        },
      },
      {
        spell: SPELLS.EMPOWER_WARDS,
        buffSpellId: SPELLS.EMPOWER_WARDS.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 20,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.35,
          extraSuggestion: <span><SpellLink id={SPELLS.EMPOWER_WARDS.id} /> Is a low CD ability, use it frequently to keep magic damage low. </span>,
        },
      },
      {
        spell: SPELLS.FRACTURE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.FIERY_BRAND,
        buffSpellId: SPELLS.FIERY_BRAND_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: <span>Powerful CD. Use it during high damage moments.</span>,
        },
      },
      {
        spell: SPELLS.METAMORPHOSIS_TANK,
        buffSpellId: SPELLS.METAMORPHOSIS_TANK.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.THROW_GLAIVE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 3,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SOUL_CLEAVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SPIRIT_BOMB_TALENT,
        buffSpellId: SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SIGIL_OF_FLAME,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.INFERNAL_STRIKE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        charges: 2,
      },
      {
        spell: SPELLS.SIGIL_OF_SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SIGIL_OF_MISERY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.IMPRISON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TORMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.CONSUME_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.SIGIL_OF_CHAINS_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SIGIL_OF_CHAINS_TALENT.id),
        cooldown: 90,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DEMONIC_INFUSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_INFUSION_TALENT.id),
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.70,
        },

      },

    ];
  }
}

export default Abilities;
