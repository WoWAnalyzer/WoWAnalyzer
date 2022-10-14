import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import {
  MASTER_OF_THE_GLAIVE_SCALING,
  PITCH_BLACK_SCALING,
} from 'analysis/retail/demonhunter/shared';
import { getInfernalStrikeCooldown } from 'analysis/retail/demonhunter/vengeance/modules/spells/InfernalStrike';
import { getMetamorphosisCooldown } from 'analysis/retail/demonhunter/shared/modules/talents/MetamorphosisCooldown';
import { PERFECTLY_BALANCED_GLAIVE_SCALING } from 'analysis/retail/demonhunter/vengeance/constants';

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
              using the <SpellLink id={TALENTS_DEMON_HUNTER.FALLOUT_TALENT.id} /> talent in order to
              maximize your <SpellLink id={SPELLS.SOUL_FRAGMENT.id} /> generation.
            </>
          ),
        },
      },
      {
        spell: [
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id)
            ? TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id
            : SPELLS.SHEAR.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id)
          ? (haste) => 4.5 / (1 + haste)
          : 0,
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id),
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
        cooldown: getMetamorphosisCooldown(combatant),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_TALENT.id) ? 1 : 0),
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
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.RETALIATION_TALENT.id),
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id),
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
        spell: [
          SPELLS.SIGIL_OF_CHAINS_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT.id,
          SPELLS.SIGIL_OF_CHAINS_PRECISE.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id),
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
        spell: TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id,
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
        spell: [
          TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT.id,
          SPELLS.ELYSIAN_DECREE_CONCENTRATED.id,
          SPELLS.ELYSIAN_DECREE_PRECISE.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown:
          60 *
          (1 - (combatant.hasTalent(TALENTS_DEMON_HUNTER.QUICKENED_SIGILS_TALENT.id) ? 0.2 : 0)),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT.id),
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
      {
        spell: TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id} /> is when you're expecting
              adds to spawn soon or are preparing for a burst window.
            </>
          ),
        },
      },
      {
        spell: TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          extraSuggestion: (
            <>
              The only time you should delay casting{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id} /> is when you're expecting
              are preparing for a burst window.
            </>
          ),
        },
      },

      // Sigils
      {
        spell: [
          SPELLS.SIGIL_OF_SILENCE_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT.id,
          SPELLS.SIGIL_OF_SILENCE_PRECISE.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_SILENCE_TALENT),
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
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_MISERY_TALENT),
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
        cooldown: getInfernalStrikeCooldown(combatant),
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.HOT_FEET_TALENT.id) ? 1 : 0),
        enabled: false, // TODO: change this to true, when infernal strike logging is working, see infernalstrike module for more details.
      },
      {
        spell: TALENTS_DEMON_HUNTER.IMPRISON_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
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
        spell: SPELLS.THROW_GLAIVE_VENGEANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          9 -
          PERFECTLY_BALANCED_GLAIVE_SCALING[
            combatant.getTalentRank(TALENTS_DEMON_HUNTER.PERFECTLY_BALANCED_GLAIVE_TALENT)
          ],
        charges:
          1 +
          MASTER_OF_THE_GLAIVE_SCALING[
            combatant.getTalentRank(TALENTS_DEMON_HUNTER.MASTER_OF_THE_GLAIVE_TALENT)
          ],
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
