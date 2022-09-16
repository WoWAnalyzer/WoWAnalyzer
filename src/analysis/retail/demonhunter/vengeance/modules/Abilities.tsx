import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { PITCH_BLACK_SCALING } from 'analysis/retail/demonhunter/shared';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotation
      {
        spell: SPELLS.IMMOLATION_AURA.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              This is a great Fury filler spell. Try to always cast it on cooldown, specially when
              using the <SpellLink id={TALENTS_DEMON_HUNTER.FALLOUT_VENGEANCE_TALENT.id} /> talent
              in order to maximize your <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generation.
            </>
          ),
        },
      },
      {
        spell: [
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_VENGEANCE_TALENT.id)
            ? TALENTS_DEMON_HUNTER.FRACTURE_VENGEANCE_TALENT.id
            : SPELLS.SHEAR.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_VENGEANCE_TALENT.id)
          ? (haste) => 4.5 / (1 + haste)
          : 0,
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_VENGEANCE_TALENT.id) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_VENGEANCE_TALENT.id),
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 1500,
        },
      },

      // Defensive / Healing
      {
        spell: SPELLS.SOUL_CLEAVE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.METAMORPHOSIS_TANK.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS_DEMON_HUNTER.FIERY_BRAND_VENGEANCE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        charges:
          1 +
          (combatant.hasTalent(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_VENGEANCE_TALENT.id) ? 1 : 0),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: <>Powerful CD. Use it during high damage moments.</>,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.DEMON_SPIKES.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: (haste) => 20 / (1 + haste),
        charges: 2,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.RETALIATION_VENGEANCE_TALENT.id),
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS_DEMON_HUNTER.BLUR_TALENT.id,
        buffSpellId: TALENTS_DEMON_HUNTER.BLUR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.BLUR_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        buffSpellId: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.BLUR_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          300 -
          PITCH_BLACK_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.PITCH_BLACK_TALENT.id)],
        gcd: {
          base: 1500,
        },
      },

      // Talents
      {
        spell: TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_VENGEANCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_VENGEANCE_TALENT.id),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_VENGEANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.SOUL_BARRIER_VENGEANCE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_VENGEANCE_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: <>This is a great Fury generator spell. </>,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.FEL_DEVASTATION_VENGEANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: <>This is a great healing and AoE damage burst spell.</>,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.ELYSIAN_DECREE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_VENGEANCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.THE_HUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id),
      },

      // Sigils
      {
        spell: [
          SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT.id,
          SPELLS.SIGIL_OF_SILENCE_PRECISE.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
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
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.MISERY_IN_DEFEAT_TALENT.id),
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
          30 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Cast on cooldown for a dps increase.`,
        },
      },

      // Utility
      {
        spell: SPELLS.INFERNAL_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.HOT_FEET_TALENT.id) ? 1 : 0),
        enabled: false, // TODO: change this to true, when infernal strike logging is working, see infernalstrike module for more details.
      },
      {
        spell: TALENTS_DEMON_HUNTER.IMPRISON_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TORMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.CONSUME_MAGIC.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISRUPT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.THROW_GLAIVE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: (haste) => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GLIDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },

      // Misc
      {
        spell: SPELLS.SOUL_FRAGMENT.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
