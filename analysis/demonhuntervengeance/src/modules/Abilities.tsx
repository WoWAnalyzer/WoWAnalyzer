import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import {
  FEL_DEFENDER_COOLDOWN_REDUCTION,
  INCREASED_SCRUTINY_SCALING,
} from '@wowanalyzer/demonhunter';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotation
      {
        spell: DH_SPELLS.IMMOLATION_AURA.id,
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
              using the <SpellLink id={DH_TALENTS.FALLOUT_TALENT.id} /> talent in order to maximize
              your <SpellLink id={DH_SPELLS.SOUL_FRAGMENT.id} /> generation.
            </>
          ),
        },
      },
      {
        spell: [
          combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id)
            ? DH_TALENTS.FRACTURE_TALENT.id
            : DH_SPELLS.SHEAR.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id)
          ? (haste) => 4.5 / (1 + haste)
          : 0,
        charges: combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id),
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 1500,
        },
      },

      // Defensive / Healing
      {
        spell: DH_SPELLS.SOUL_CLEAVE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: DH_SPELLS.METAMORPHOSIS_TANK.id,
        buffSpellId: DH_SPELLS.METAMORPHOSIS_TANK.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: DH_SPELLS.FIERY_BRAND.id,
        buffSpellId: DH_SPELLS.FIERY_BRAND_DEBUFF.id,
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
        spell: DH_SPELLS.DEMON_SPIKES.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: (haste) => 20 / (1 + haste),
        charges: 2,
        isDefensive: true,
      },

      // Talents
      {
        spell: DH_TALENTS.SIGIL_OF_CHAINS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(DH_TALENTS.SIGIL_OF_CHAINS_TALENT.id),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_TALENTS.SPIRIT_BOMB_TALENT.id,
        buffSpellId: DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_TALENTS.SOUL_BARRIER_TALENT.id,
        buffSpellId: DH_TALENTS.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.SOUL_BARRIER_TALENT.id),
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
        spell: DH_TALENTS.FELBLADE_TALENT.id,
        enabled: combatant.hasTalent(DH_TALENTS.FELBLADE_TALENT.id),
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
        spell: DH_SPELLS.FEL_DEVASTATION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: combatant.hasConduitBySpellID(DH_CONDUITS.FEL_DEFENDER.id)
          ? 60 -
            FEL_DEFENDER_COOLDOWN_REDUCTION[
              combatant.conduitRankBySpellID(DH_CONDUITS.FEL_DEFENDER.id)
            ]
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
        spell: [
          DH_SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id,
          DH_SPELLS.SIGIL_OF_SILENCE_QUICKENED.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(DH_TALENTS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [DH_SPELLS.SIGIL_OF_MISERY_CONCENTRATED.id, DH_SPELLS.SIGIL_OF_MISERY_QUICKENED.id],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * (1 - (combatant.hasTalent(DH_TALENTS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [DH_SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id, DH_SPELLS.SIGIL_OF_FLAME_QUICKENED.id],
        buffSpellId: DH_SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30 * (1 - (combatant.hasTalent(DH_TALENTS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: !(
          combatant.hasCovenant(COVENANTS.KYRIAN.id) &&
          combatant.hasLegendary(DH_LEGENDARIES.RAZELIKHS_DEFILEMENT)
        ),
        castEfficiency: {
          suggestion: !(
            combatant.hasCovenant(COVENANTS.KYRIAN.id) &&
            combatant.hasLegendary(DH_LEGENDARIES.RAZELIKHS_DEFILEMENT)
          ),
          recommendedEfficiency: 0.9,
          extraSuggestion: combatant.hasTalent(DH_TALENTS.ABYSSAL_STRIKE_TALENT.id) ? (
            <>
              Line this up with <SpellLink id={DH_SPELLS.INFERNAL_STRIKE.id} /> to double stack{' '}
              <SpellLink id={DH_SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} /> because of the{' '}
              <SpellLink id={DH_TALENTS.ABYSSAL_STRIKE_TALENT.id} /> talent.
            </>
          ) : (
            `Cast on cooldown for a dps increase.`
          ),
        },
      },

      // Utility
      {
        spell: DH_SPELLS.INFERNAL_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(DH_TALENTS.ABYSSAL_STRIKE_TALENT.id) ? 12 : 20,
        charges: 2,
        enabled: false, // TODO: change this to true, when infernal strike logging is working, see infernalstrike module for more details.
      },

      {
        spell: DH_SPELLS.IMPRISON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.TORMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: DH_SPELLS.CONSUME_MAGIC.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.DISRUPT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: DH_SPELLS.THROW_GLAIVE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: (haste) => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: DH_SPELLS.GLIDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },

      // Misc
      {
        spell: DH_SPELLS.SOUL_FRAGMENT.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
      },

      // Covenant (move these if needed)
      {
        spell: [DH_COVENANTS.ELYSIAN_DECREE.id, DH_COVENANTS.ELYSIAN_DECREE_REPEAT_DECREE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60 * (1 - (combatant.hasTalent(DH_TALENTS.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
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
        spell: DH_COVENANTS.SINFUL_BRAND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasConduitBySpellID(DH_CONDUITS.INCREASED_SCRUTINY.id)
          ? 45 -
            INCREASED_SCRUTINY_SCALING[
              combatant.conduitRankBySpellID(DH_CONDUITS.INCREASED_SCRUTINY.id)
            ]
          : 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: DH_COVENANTS.THE_HUNT.id,
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
