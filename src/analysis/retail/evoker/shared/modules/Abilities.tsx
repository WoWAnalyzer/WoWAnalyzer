import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SPECS from 'game/SPECS';
import Combatant from 'parser/core/Combatant';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import spells from 'common/SPELLS/dragonflight/trinkets';
import trinkets from 'common/ITEMS/dragonflight/trinkets';
import { BASE_EVOKER_RANGE, EMPOWER_BASE_GCD, EMPOWER_MINIMUM_GCD } from '../constants';

const hasFont = (combatant: Combatant) =>
  combatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT) ||
  combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
  combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT);

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    const intervowenThreadsMultiplier = combatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT)
      ? 0.9
      : 1;
    return [
      //region Rotational Spells
      {
        spell: SPELLS.DISINTEGRATE.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
        range: BASE_EVOKER_RANGE,
        enabled: combatant.spec !== SPECS.AUGMENTATION_EVOKER,
      },
      {
        spell: SPELLS.EMERALD_BLOSSOM_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown:
          combatant.spec === SPECS.PRESERVATION_EVOKER ? 0 : 30 * intervowenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        range: BASE_EVOKER_RANGE,
        damageSpellIds: [SPELLS.EMERALD_BLOSSOM_CAST.id],
        isDefensive: true,
      },
      //endregion
      //region Damage Spells
      {
        spell: hasFont(combatant) ? SPELLS.FIRE_BREATH_FONT.id : SPELLS.FIRE_BREATH.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30 * intervowenThreadsMultiplier,
        gcd: {
          base: EMPOWER_BASE_GCD,
          minimum: EMPOWER_MINIMUM_GCD,
        },
        ...(combatant.spec === (SPECS.DEVASTATION_EVOKER || SPECS.AUGMENTATION_EVOKER) && {
          castEfficiency: {
            suggestion: true,
            recommendedEfficiency: 0.95,
          },
        }),
        range: BASE_EVOKER_RANGE,
      },
      {
        spell: SPELLS.LIVING_FLAME_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        range: BASE_EVOKER_RANGE,
        damageSpellIds: [SPELLS.LIVING_FLAME_DAMAGE.id],
      },
      {
        spell: SPELLS.AZURE_STRIKE.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        range: BASE_EVOKER_RANGE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.VERDANT_EMBRACE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 24 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.VERDANT_EMBRACE_TALENT),
        gcd: {
          base: 1500,
        },

        damageSpellIds: [TALENTS.VERDANT_EMBRACE_TALENT.id],
        isDefensive: true,
      },
      //endregion
      //region Cooldowns
      {
        spell: combatant.hasTalent(TALENTS.MANEUVERABILITY_TALENT)
          ? SPELLS.DEEP_BREATH_SCALECOMMANDER.id
          : SPELLS.DEEP_BREATH.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.ONYX_LEGACY_TALENT)
          ? 60
          : 120 * intervowenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.DEEP_BREATH_DAM.id],
        enabled: !combatant.hasTalent(TALENTS.BREATH_OF_EONS_TALENT),
      },
      {
        spell: TALENTS.TIP_THE_SCALES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.TIP_THE_SCALES_TALENT),
      },
      //endregion
      //region Utility
      {
        spell: TALENTS.CAUTERIZING_FLAME_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.CAUTERIZING_FLAME_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ZEPHYR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.ZEPHYR_TALENT),
        gcd: {
          base: 1500,
        },
        isDefensive: true,
      },
      {
        spell: TALENTS.LANDSLIDE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90 * intervowenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.LANDSLIDE_TALENT),
      },
      {
        spell: TALENTS.EXPUNGE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.EXPUNGE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SLEEP_WALK_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15 * intervowenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SLEEP_WALK_TALENT),
      },
      {
        spell: TALENTS.QUELL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.IMPOSING_PRESENCE_TALENT)
          ? 20 * intervowenThreadsMultiplier
          : 40 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.QUELL_TALENT),
      },
      {
        spell: TALENTS.UNRAVEL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 9 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.UNRAVEL_TALENT),
        gcd: {
          base: 1500,
        },
        range: BASE_EVOKER_RANGE,
      },
      {
        spell: TALENTS.OPPRESSING_ROAR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.OPPRESSING_ROAR_TALENT),
      },
      {
        spell: TALENTS.RESCUE_TALENT.id,
        category: combatant.hasTalent(TALENTS.TWIN_GUARDIAN_TALENT)
          ? SPELL_CATEGORY.DEFENSIVE
          : SPELL_CATEGORY.UTILITY,
        cooldown: 60 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.RESCUE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TIME_SPIRAL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.TIME_SPIRAL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOVER.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 * intervowenThreadsMultiplier,
        charges: combatant.hasTalent(TALENTS.AERIAL_MASTERY_TALENT) ? 2 : 1,
        gcd: null,
        enabled: true,
      },
      //endregion
      //region Defensive
      {
        spell: TALENTS.OBSIDIAN_SCALES_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 * intervowenThreadsMultiplier,
        charges: combatant.hasTalent(TALENTS.OBSIDIAN_BULWARK_TALENT) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS.OBSIDIAN_SCALES_TALENT),
        isDefensive: true,
      },
      {
        spell: TALENTS.RENEWING_BLAZE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.FIRE_WITHIN_TALENT)
          ? 60 * intervowenThreadsMultiplier
          : 90 * intervowenThreadsMultiplier,
        enabled: combatant.hasTalent(TALENTS.RENEWING_BLAZE_TALENT),
        isDefensive: true,
      },
      //endregion
      //region Other
      {
        spell: SPELLS.BLESSING_OF_THE_BRONZE.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 15 * intervowenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SOURCE_OF_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SOURCE_OF_MAGIC_TALENT),
      },
      {
        spell: SPELLS.GLIDE_EVOKER.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
      },
      //endregion
      //region Items
      {
        spell: spells.IRIDEUS_FRAGMENT.id,
        category: SPELL_CATEGORY.ITEMS,
        name: 'Irideus_Fragment',
        gcd: null,
        cooldown: 180,
        enabled: combatant.hasTrinket(trinkets.IRIDEUS_FRAGMENT.id),
      },
      {
        spell: [
          spells.SPOILS_OF_NELTHARUS_CRIT.id,
          spells.SPOILS_OF_NELTHARUS_HASTE.id,
          spells.SPOILS_OF_NELTHARUS_MASTERY.id,
          spells.SPOILS_OF_NELTHARUS_VERSATILITY.id,
        ],
        category: SPELL_CATEGORY.ITEMS,
        name: 'Spoils_of_Neltharus',
        gcd: null,
        cooldown: 120,
        enabled: combatant.hasTrinket(trinkets.SPOILS_OF_NELTHARUS.id),
      },
      {
        spell: spells.MIRROR_OF_FRACTURED_TOMORROWS.id,
        category: SPELL_CATEGORY.ITEMS,
        name: 'Irideus_Fragment',
        gcd: null,
        cooldown: 180,
        enabled: combatant.hasTrinket(trinkets.MIRROR_OF_FRACTURED_TOMORROWS.id),
      },
      //endregion
    ];
  }
}

export default Abilities;
