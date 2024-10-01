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
        spell: SPELLS.GLIDE_DH.id,
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
        cooldown: 45,
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
              <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} /> is when you're expecting
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
        spell: [TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT.id, SPELLS.SIGIL_OF_MISERY_PRECISE.id],
        enabled: this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          120 -
          (combatant.hasTalent(TALENTS_DEMON_HUNTER.IMPROVED_SIGIL_OF_MISERY_TALENT) ? 30 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.SIGIL_OF_FLAME.id,
          SPELLS.SIGIL_OF_FLAME_PRECISE.id,
          SPELLS.SIGIL_OF_DOOM_CAST.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.ILLUMINATED_SIGILS_TALENT) ? 1 : 0),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
        damageSpellIds: [SPELLS.SIGIL_OF_FLAME_DEBUFF.id],
      },
      {
        spell: [TALENTS_DEMON_HUNTER.SIGIL_OF_SPITE_TALENT.id, SPELLS.SIGIL_OF_SPITE_PRECISE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_SPITE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.SIGIL_OF_SPITE_TALENT} /> is when you're
              expecting adds to spawn soon.
            </>
          ),
        },
      },

      // Aldrachi Reaver
      {
        spell: SPELLS.REAVERS_GLAIVE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
    ];
  }
}
