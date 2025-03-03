import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import ClassAbilities from '../../shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends ClassAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      ...super.spellbook(),
      // Enhancement baseline
      {
        spell: SPELLS.MAELSTROM_WEAPON_BUFF.id,
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.FERAL_LUNGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
      },

      // Enhancement talents
      {
        spell: TALENTS.LAVA_LASH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LAVA_LASH_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) =>
          (18 - (combatant.hasTalent(TALENTS.MOLTEN_ASSAULT_TALENT) ? 6 : 0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
        range: 5,
      },
      {
        spell: TALENTS.FERAL_SPIRIT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        // This is no error. We actually use the elemental shaman elemental blast spell id.
        spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT),
        charges: combatant.getMultipleTalentRanks(
          TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT,
          TALENTS.LAVA_BURST_TALENT,
        ),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        gcd: {
          base: 1500,
        },
        range: 40,
      },
      {
        spell: SPELLS.STORMSTRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 7.5 / (1 + haste),
        charges: 1 + (this.selectedCombatant.hasTalent(TALENTS.STORMS_WRATH_TALENT) ? 1 : 0),
        gcd: {
          base: 1500,
        },
        range: 5,
      },
      {
        spell: TALENTS.CRASH_LIGHTNING_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 12 / (1 + haste),
      },
      {
        spell: TALENTS.SUNDERING_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SUNDERING_TALENT),
        cooldown: 40 - (this.selectedCombatant.hasTalent(TALENTS.MOLTEN_THUNDER_TALENT) ? 10 : 0),
      },
      {
        spell: TALENTS.FIRE_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.FIRE_NOVA_TALENT),
        cooldown: (haste) => 15 / (1 + haste),
      },
      /** This version procs on spending maelstrom, has no cooldown, and has a 40 yard range */
      {
        spell: TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT),
        range: 40,
      },
      /** This version has a 15 sec cooldown and is melee range */
      {
        spell: TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT),
        cooldown: (haste) => 15 / (1 + haste),
        range: 5,
      },
      {
        spell: [SPELLS.PRIMORDIAL_WAVE.id, SPELLS.PRIMORDIAL_WAVE_DAMAGE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
        range: 40,
      },
      {
        spell: TALENTS.DOOM_WINDS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        cooldown: 60,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1,
        },
      },
      {
        spell: SPELLS.WINDFURY_ATTACK.id,
        enabled: combatant.hasTalent(TALENTS.WINDFURY_WEAPON_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.FLAMETONGUE_ATTACK.id,
        enabled: true,
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id],
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.STORMBLAST_DAMAGE.id,
        enabled: combatant.hasTalent(TALENTS.STORMBLAST_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: [SPELLS.WINDSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id],
        enabled:
          combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
          combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: [SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
        enabled:
          combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
          combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.TEMPEST_CAST.id,
        enabled: combatant.hasTalent(TALENTS.TEMPEST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HAILSTORM_TALENT.id,
        category: SPELL_CATEGORY.HIDDEN,
        enabled: combatant.hasTalent(TALENTS.HAILSTORM_TALENT),
      },
      {
        spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        cooldown:
          180 - (this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT) ? 60 : 0),
      },
      {
        spell: SPELLS.VOLTAIC_BLAZE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT),
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
