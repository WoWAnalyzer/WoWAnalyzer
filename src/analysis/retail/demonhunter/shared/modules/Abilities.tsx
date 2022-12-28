import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { PITCH_BLACK_SCALING } from 'analysis/retail/demonhunter/shared';

export default class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Baseline
      {
        spell: SPELLS.GLIDE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1,
        gcd: null,
      },
      {
        spell: SPELLS.DISRUPT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.TORMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.SPECTRAL_SIGHT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },

      // Talents
      {
        spell: TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FELBLADE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        // Felblade cooldown can be reset by Demon Bite. But its CD reset is not any event, so can't track if it resets or not.
        cooldown: (haste) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion:
            'This is an important Fury generator spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. And also it can be used to charge to the desired target, making it very strong movement spell.',
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.CHAOS_NOVA_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.CHAOS_NOVA_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.UNLEASHED_POWER_TALENT) ? 40 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.CONSUME_MAGIC_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.CONSUME_MAGIC_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id} /> is when you're expecting
              adds to spawn soon.
            </>
          ),
        },
        damageSpellIds: [SPELLS.THE_HUNT_CHARGE.id, SPELLS.THE_HUNT_DOT.id],
      },
      {
        spell: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.DARKNESS_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          300 -
          PITCH_BLACK_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.PITCH_BLACK_TALENT)],
        gcd: {
          base: 1500,
        },
      },

      // Sigils
      {
        spell: [
          SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT.id,
          SPELLS.SIGIL_OF_SILENCE_PRECISE.id,
        ],
        enabled: this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 * (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.SIGIL_OF_MISERY_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT.id,
          SPELLS.SIGIL_OF_MISERY_PRECISE.id,
        ],
        enabled: this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 * (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.MISERY_IN_DEFEAT_TALENT),
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
      },
      {
        spell: [
          SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT.id,
          SPELLS.SIGIL_OF_FLAME_PRECISE.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown:
          30 * (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
      },
      {
        spell: [
          TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT.id,
          SPELLS.ELYSIAN_DECREE_CONCENTRATED.id,
          SPELLS.ELYSIAN_DECREE_PRECISE.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown:
          60 * (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT.id} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },
    ];
  }
}
