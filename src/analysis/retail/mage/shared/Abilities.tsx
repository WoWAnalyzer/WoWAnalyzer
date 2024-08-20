import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS.FROSTFIRE_BOLT_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: (haste: any) =>
          combatant.spec === SPECS.FROST_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 12 / 1.3 / (1 + haste)
            : 12 / (1 + haste),
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CONE_OF_COLD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown:
          combatant.spec === SPECS.FIRE_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 12 / 1.3
            : 12,
        timelineSortIndex: 8,
        //damageSpellIds: [SPELLS.CONE_OF_COLD.id], // needs verification
      },
      {
        spell: TALENTS.DRAGONS_BREATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.DRAGONS_BREATH_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown:
          combatant.spec === SPECS.FROST_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 45 / 1.3
            : 45,
      },
      {
        spell: TALENTS.BLAST_WAVE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.BLAST_WAVE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown:
          combatant.spec === SPECS.FROST_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 30 / 1.3
            : 30,
      },
      {
        spell: TALENTS.ICE_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ICE_NOVA_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown:
          combatant.spec === SPECS.FIRE_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 25 / 1.3
            : 25,
        timelineSortIndex: 9,
        //damageSpellIds: [SPELLS.ICE_NOVA_TALENT.id], // needs verification
      },
      {
        spell: TALENTS.SUPERNOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SUPERNOVA_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.FROSTFIRE_BOLT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.FROSTFIRE_BOLT_TALENT),
        gcd: {
          base: 1500,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.TIME_WARP.id,
        buffSpellId: SPELLS.TIME_WARP.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300,
        timelineSortIndex: 18,
      },
      {
        spell: TALENTS.SHIFTING_POWER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },

      //Defensives
      {
        spell: TALENTS.ICE_BARRIER_TALENT.id,
        buffSpellId: TALENTS.ICE_BARRIER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.ICE_BARRIER_TALENT),
        cooldown:
          combatant.hasTalent(TALENTS.ACCUMULATIVE_SHIELDING_TALENT) &&
          combatant.hasBuff(TALENTS.ICE_BARRIER_TALENT.id)
            ? 25 / 1.3
            : 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLAZING_BARRIER_TALENT.id,
        buffSpellId: TALENTS.BLAZING_BARRIER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.BLAZING_BARRIER_TALENT),
        cooldown:
          combatant.hasTalent(TALENTS.ACCUMULATIVE_SHIELDING_TALENT) &&
          combatant.hasBuff(TALENTS.BLAZING_BARRIER_TALENT.id)
            ? 25 / 1.3
            : 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PRISMATIC_BARRIER_TALENT.id,
        buffSpellId: TALENTS.PRISMATIC_BARRIER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.PRISMATIC_BARRIER_TALENT),
        cooldown:
          combatant.hasTalent(TALENTS.ACCUMULATIVE_SHIELDING_TALENT) &&
          combatant.hasBuff(TALENTS.PRISMATIC_BARRIER_TALENT.id)
            ? 25 / 1.3
            : 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ICE_BLOCK_TALENT.id,
        buffSpellId: TALENTS.ICE_BLOCK_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled:
          combatant.hasTalent(TALENTS.ICE_BLOCK_TALENT) &&
          !combatant.hasTalent(TALENTS.ICE_COLD_TALENT),
        cooldown: 240 - combatant.getTalentRank(TALENTS.WINTERS_PROTECTION_TALENT) * 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICE_COLD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.ICE_COLD_TALENT),
        cooldown: 240 - combatant.getTalentRank(TALENTS.WINTERS_PROTECTION_TALENT) * 30,
        gcd: null,
      },
      {
        spell: TALENTS.MIRROR_IMAGE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.MIRROR_IMAGE_TALENT),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MASS_BARRIER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.MASS_BARRIER_TALENT),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },

      //Utility
      {
        spell: SPELLS.ARCANE_INTELLECT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_NOVA.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          combatant.spec === SPECS.FIRE_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 30 / 1.3
            : 30,
        charges: 1 + combatant.getTalentRank(TALENTS.ICE_WARD_TALENT),
      },
      {
        spell: TALENTS.RING_OF_FROST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.RING_OF_FROST_TALENT),
        cooldown:
          combatant.spec === SPECS.FIRE_MAGE &&
          combatant.hasTalent(TALENTS.ELEMENTAL_AFFINITY_TALENT)
            ? 45 / 1.3
            : 45,
      },
      {
        spell: SPELLS.BLINK.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(TALENTS.SHIMMER_TALENT),
        cooldown: 15 - combatant.getTalentRank(TALENTS.FLOW_OF_TIME_TALENT) * 2,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DISPLACEMENT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.DISPLACEMENT_TALENT),
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SHIMMER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.SHIMMER_TALENT),
        cooldown: 25 - combatant.getTalentRank(TALENTS.FLOW_OF_TIME_TALENT) * 2,
        charges: 2,
        gcd: null,
      },
      {
        spell: TALENTS.ICE_FLOES_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.ICE_FLOES_TALENT),
        cooldown: 20,
        charges: 3,
        gcd: null,
      },
      {
        spell: SPELLS.COUNTERSPELL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 24,
        gcd: null,
      },
      {
        spell: TALENTS.REMOVE_CURSE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.REMOVE_CURSE_TALENT),
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SLOW_FALL.id,
        buffSpellId: SPELLS.SLOW_FALL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SLOW_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.SLOW_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SPELLSTEAL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.SPELLSTEAL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ALTER_TIME_TALENT.id,
        buffSpellId: SPELLS.ALTER_TIME_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.ALTER_TIME_TALENT),
        cooldown: 60 - combatant.getTalentRank(TALENTS.ALTER_TIME_TALENT) * 10,
        gcd: null,
      },
      {
        spell: SPELLS.ALTER_TIME_RETURN.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.ALTER_TIME_TALENT),
        cooldown: 0,
        gcd: null,
      },
      {
        spell: SPELLS.INVISIBILITY.id,
        buffSpellId: SPELLS.INVISIBILITY_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(TALENTS.GREATER_INVISIBILITY_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 300,
      },
      {
        spell: TALENTS.GREATER_INVISIBILITY_TALENT.id,
        buffSpellId: SPELLS.GREATER_INVISIBILITY_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.GREATER_INVISIBILITY_TALENT),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MASS_INVISIBILITY_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.MASS_INVISIBILITY_TALENT),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MASS_POLYMORPH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.MASS_POLYMORPH_TALENT),
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.POLYMORPH_SHEEP.id,
          SPELLS.POLYMORPH_PIG.id,
          SPELLS.POLYMORPH_BLACK_CAT.id,
          SPELLS.POLYMORPH_MONKEY.id,
          SPELLS.POLYMORPH_RABBIT.id,
          SPELLS.POLYMORPH_POLAR_BEAR_CUB.id,
          SPELLS.POLYMORPH_PORCUPINE.id,
          SPELLS.POLYMORPH_TURTLE.id,
          SPELLS.POLYMORPH_TURKEY.id,
          SPELLS.POLYMORPH_PENGUIN.id,
          SPELLS.POLYMORPH_BUMBLEBEE.id,
          SPELLS.POLYMORPH_PEACOCK.id,
          SPELLS.POLYMORPH_DIREHORN.id,
          SPELLS.POLYMORPH_MAWRAT.id,
          SPELLS.POLYMORPH_DUCK.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
