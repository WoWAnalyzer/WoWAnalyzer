import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SharedAbilities from 'analysis/retail/demonhunter/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { MASTER_OF_THE_GLAIVE_SCALING } from 'analysis/retail/demonhunter/shared';
import { getInfernalStrikeCooldown } from 'analysis/retail/demonhunter/vengeance/modules/spells/InfernalStrike';
import { getMetamorphosisCooldown } from 'analysis/retail/demonhunter/shared/modules/talents/MetamorphosisCooldown';
import {
  DOWN_IN_FLAMES_CDR_SCALING,
  PERFECTLY_BALANCED_GLAIVE_SCALING,
} from 'analysis/retail/demonhunter/vengeance/constants';

class Abilities extends SharedAbilities {
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
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT)
            ? TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id
            : SPELLS.SHEAR.id,
        ],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT)
          ? (haste) => 4.5 / (1 + haste)
          : 0,
        charges: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT) ? 2 : 0,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT),
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
        cooldown:
          60 -
          DOWN_IN_FLAMES_CDR_SCALING[
            combatant.getTalentRank(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_TALENT)
          ],
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.DOWN_IN_FLAMES_TALENT) ? 1 : 0),
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
          suggestion: combatant.hasTalent(TALENTS_DEMON_HUNTER.RETALIATION_TALENT),
          recommendedEfficiency: 0.5,
        },
        isDefensive: true,
      },

      // Talents
      {
        spell: TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        // Not actually on the GCD but blocks all spells during its animation for 1 second. The issue is you can follow up any ability on the GCD with Vengeful Retreat, so it can still cause overlap.
        gcd: null,
      },
      {
        spell: [
          SPELLS.SIGIL_OF_CHAINS_CONCENTRATED.id,
          TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT.id,
          SPELLS.SIGIL_OF_CHAINS_PRECISE.id,
        ],
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_CHAINS_TALENT),
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
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
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
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FELBLADE_TALENT),
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
        spell: TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT),
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

      // Utility
      {
        spell: SPELLS.INFERNAL_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: getInfernalStrikeCooldown(combatant),
        charges: 1 + (combatant.hasTalent(TALENTS_DEMON_HUNTER.BLAZING_PATH_TALENT) ? 1 : 0),
        enabled: false, // TODO: change this to true, when infernal strike logging is working, see infernalstrike module for more details.
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

      // Misc
      {
        spell: [
          SPELLS.SOUL_FRAGMENT.id,
          SPELLS.SOUL_FRAGMENT_KILLING_BLOW.id,
          SPELLS.SOUL_FRAGMENT_FODDER.id,
        ],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
      },

      ...super.spellbook(),
    ];
  }
}

export default Abilities;
