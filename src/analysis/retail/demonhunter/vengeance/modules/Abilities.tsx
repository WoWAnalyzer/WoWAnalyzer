import {
  FEL_DEFENDER_COOLDOWN_REDUCTION,
  INCREASED_SCRUTINY_SCALING,
} from 'analysis/retail/demonhunter/shared';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

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
              using the <SpellLink id={SPELLS.FALLOUT_TALENT.id} /> talent in order to maximize your{' '}
              <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generation.
            </>
          ),
        },
      },
      {
        spell: [
          combatant.hasTalent(SPELLS.FRACTURE_TALENT.id)
            ? SPELLS.FRACTURE_TALENT.id
            : SPELLS.SHEAR.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) ? (haste) => 4.5 / (1 + haste) : 0,
        charges: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.FRACTURE_TALENT.id),
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
        buffSpellId: SPELLS.METAMORPHOSIS_TANK.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: SPELLS.FIERY_BRAND.id,
        buffSpellId: SPELLS.FIERY_BRAND_DEBUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
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
        isDefensive: true,
      },

      // Talents
      {
        spell: SPELLS.SIGIL_OF_CHAINS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SIGIL_OF_CHAINS_TALENT.id),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRIT_BOMB_TALENT.id,
        buffSpellId: SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOUL_BARRIER_TALENT.id,
        buffSpellId: SPELLS.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id),
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
        spell: SPELLS.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
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
        spell: SPELLS.FEL_DEVASTATION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: combatant.hasConduitBySpellID(SPELLS.FEL_DEFENDER.id)
          ? 60 -
            FEL_DEFENDER_COOLDOWN_REDUCTION[combatant.conduitRankBySpellID(SPELLS.FEL_DEFENDER.id)]
          : 60,
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

      // Sigils
      {
        spell: [SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id, SPELLS.SIGIL_OF_SILENCE_QUICKENED.id],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.SIGIL_OF_MISERY_CONCENTRATED.id, SPELLS.SIGIL_OF_MISERY_QUICKENED.id],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id, SPELLS.SIGIL_OF_FLAME_QUICKENED.id],
        buffSpellId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: !(
          combatant.hasCovenant(COVENANTS.KYRIAN.id) &&
          combatant.hasLegendary(SPELLS.RAZELIKHS_DEFILEMENT)
        ),
        castEfficiency: {
          suggestion: !(
            combatant.hasCovenant(COVENANTS.KYRIAN.id) &&
            combatant.hasLegendary(SPELLS.RAZELIKHS_DEFILEMENT)
          ),
          recommendedEfficiency: 0.9,
          extraSuggestion: combatant.hasTalent(SPELLS.ABYSSAL_STRIKE_TALENT.id) ? (
            <>
              Line this up with <SpellLink id={SPELLS.INFERNAL_STRIKE.id} /> to double stack{' '}
              <SpellLink id={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} /> because of the{' '}
              <SpellLink id={SPELLS.ABYSSAL_STRIKE_TALENT.id} /> talent.
            </>
          ) : (
            `Cast on cooldown for a dps increase.`
          ),
        },
      },

      // Utility
      {
        spell: SPELLS.INFERNAL_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.ABYSSAL_STRIKE_TALENT.id) ? 12 : 20,
        charges: 2,
        enabled: false, // TODO: change this to true, when infernal strike logging is working, see infernalstrike module for more details.
      },

      {
        spell: SPELLS.IMPRISON.id,
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

      // Covenant (move these if needed)
      {
        spell: [SPELLS.ELYSIAN_DECREE.id, SPELLS.ELYSIAN_DECREE_REPEAT_DECREE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60 * (1 - (combatant.hasTalent(SPELLS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SINFUL_BRAND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasConduitBySpellID(SPELLS.INCREASED_SCRUTINY.id)
          ? 45 -
            INCREASED_SCRUTINY_SCALING[combatant.conduitRankBySpellID(SPELLS.INCREASED_SCRUTINY.id)]
          : 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: SPELLS.THE_HUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
    ];
  }
}

export default Abilities;
