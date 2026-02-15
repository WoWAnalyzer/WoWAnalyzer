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
        spell: SPELLS.STORMSTRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 7.5 / (1 + haste),
        charges: 1 + (combatant.hasTalent(TALENTS.STORMS_WRATH_TALENT) ? 1 : 0),
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
        cooldown: (haste) => 15 / (1 + haste),
      },
      {
        spell: TALENTS.SUNDERING_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SUNDERING_TALENT),
        cooldown: 30,
      },
      {
        spell: TALENTS.FIRE_NOVA_TALENT.id,
        category: SPELL_CATEGORY.HIDDEN,
        enabled: combatant.hasTalent(TALENTS.FIRE_NOVA_TALENT),
      },
      {
        spell: SPELLS.PRIMORDIAL_STORM_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 150,
        },
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT),
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
        enabled: true,
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
        spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        cooldown: 180 - (combatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT) ? 60 : 0),
      },

      // Hero talents
      {
        spell: SPELLS.TEMPEST_CAST.id,
        enabled: combatant.hasTalent(TALENTS.TEMPEST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SURGING_TOTEM.id,
        enabled: combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SUNDERING_EARTHSURGE.id,
        enabled: combatant.hasTalent(TALENTS.EARTHSURGE_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
