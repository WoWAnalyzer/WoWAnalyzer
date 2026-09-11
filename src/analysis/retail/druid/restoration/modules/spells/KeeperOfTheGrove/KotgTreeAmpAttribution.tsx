import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { splitKotgAmpHealing } from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/kotgAmpShare';

const CENARIUS_MIGHT_HEALING_INCREASE = 0.2;
const GROVES_INSPIRATION_HEALING_INCREASE = 0.09;
const HARMONY_OF_THE_GROVE_HEALING_INCREASE = 0.05;
const POWER_OF_NATURE_HEALING_INCREASE = 0.1;

const GROVES_INSPIRATION_SPELLS = new Set([
  SPELLS.REGROWTH.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.SWIFTMEND.id,
]);

const POWER_OF_NATURE_SPELLS = new Set([
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.THRIVING_VEGETATION.id,
  SPELLS.EFFLORESCENCE_HEAL.id,
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
  SPELLS.EVERBLOOM_SPLASH_HEAL.id,
]);

export const KOTG_AMP = {
  cenariusMight: 'cenariusMight',
  grovesInspiration: 'grovesInspiration',
  harmonyOfTheGrove: 'harmonyOfTheGrove',
  powerOfNature: 'powerOfNature',
} as const;

/**
 * Hero-tree split of stacked KotG % amps. Solo cards still show full marginal value.
 */
export default class KotgTreeAmpAttribution extends Analyzer {
  treeHealing: Record<(typeof KOTG_AMP)[keyof typeof KOTG_AMP], number> = {
    cenariusMight: 0,
    grovesInspiration: 0,
    harmonyOfTheGrove: 0,
    powerOfNature: 0,
  };

  private readonly hasCenariusMight: boolean;
  private readonly hasGrovesInspiration: boolean;
  private readonly hasHarmonyOfTheGrove: boolean;
  private readonly hasPowerOfNature: boolean;

  constructor(options: Options) {
    super(options);

    this.hasCenariusMight = this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_MIGHT_TALENT);
    this.hasGrovesInspiration = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.GROVES_INSPIRATION_TALENT,
    );
    this.hasHarmonyOfTheGrove = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.HARMONY_OF_THE_GROVE_TALENT,
    );
    this.hasPowerOfNature = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_NATURE_TALENT);

    this.active =
      this.hasCenariusMight ||
      this.hasGrovesInspiration ||
      this.hasHarmonyOfTheGrove ||
      this.hasPowerOfNature;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const amps = [];

    if (this.hasCenariusMight && spellId === SPELLS.SWIFTMEND.id) {
      amps.push({ key: KOTG_AMP.cenariusMight, increase: CENARIUS_MIGHT_HEALING_INCREASE });
    }

    if (this.hasGrovesInspiration && GROVES_INSPIRATION_SPELLS.has(spellId)) {
      amps.push({
        key: KOTG_AMP.grovesInspiration,
        increase: GROVES_INSPIRATION_HEALING_INCREASE,
      });
    }

    if (this.hasHarmonyOfTheGrove) {
      // Matches HarmonyOfTheGrove card: all player healing while stacks are up
      const stacks = this.selectedCombatant.getBuffStacks(
        SPELLS.HARMONY_OF_THE_GROVE.id,
        event.timestamp,
      );
      if (stacks > 0) {
        amps.push({
          key: KOTG_AMP.harmonyOfTheGrove,
          increase: HARMONY_OF_THE_GROVE_HEALING_INCREASE * stacks,
        });
      }
    }

    if (this.hasPowerOfNature && POWER_OF_NATURE_SPELLS.has(spellId)) {
      const stacks = this.selectedCombatant.getBuffStacks(
        SPELLS.POWER_OF_NATURE.id,
        event.timestamp,
      );
      if (stacks > 0) {
        amps.push({
          key: KOTG_AMP.powerOfNature,
          increase: POWER_OF_NATURE_HEALING_INCREASE * stacks,
        });
      }
    }

    const shares = splitKotgAmpHealing(event, amps);
    for (const [key, amount] of Object.entries(shares)) {
      this.treeHealing[key as keyof typeof this.treeHealing] += amount;
    }
  }
}
