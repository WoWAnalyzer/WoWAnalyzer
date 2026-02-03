import SharedAbilities from 'analysis/retail/demonhunter/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/demonhunter';
import { ERRATIC_FELHEART_SCALING } from '../../shared';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: [SPELLS.CONSUME.id, SPELLS.DEVOUR.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.HUNGERING_SLASH_CAST.id, SPELLS.REAPERS_TOLL.id],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.REAP.id, SPELLS.CULL.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.UMBRAL_BLADE_TALENT)
          ? (haste) => 8 / (1 + haste)
          : 8,
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.SECOND_HELPING_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.VOID_RAY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_RAY_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      // Movement
      {
        spell: TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id, // Becomes a rotational ability with Hungering Slash talent
        category: combatant.hasTalent(TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: null,
      },
      {
        spell: SPELLS.SHIFT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          20 -
          ERRATIC_FELHEART_SCALING[
            combatant.getTalentRank(TALENTS_DEMON_HUNTER.ERRATIC_FELHEART_TALENT)
          ],
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.BLAZING_PATH_TALENT) ? 2 : 1,
        gcd: null,
      },
      // CC, interrupts and utility
      // DPS Cooldowns
      {
        spell: [TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT.id, SPELLS.PIERCE_THE_VEIL.id],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          static: 500,
        },
      },
      {
        spell: [TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT.id, SPELLS.PREDATORS_WAKE.id],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      // Big DPS Cooldowns
      {
        spell: 1217605,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
      },
      // Defensives
      {
        spell: SPELLS.BLUR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_RESILIENCE_TALENT) ? 2 : 1,
        gcd: null,
      },

      ...super.spellbook(),
    ];
  }
}

export default Abilities;
