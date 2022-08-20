import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COOLDOWN_SECONDS = 300 as const;

/**
 * Tracks usage of The First Sigil - https://www.wowhead.com/item=188271/the-first-sigil?bonus=6805
 */
class TheFirstSigil extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    castEfficiency: CastEfficiency,
    statTracker: StatTracker,
  };

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected castEfficiency!: CastEfficiency;
  protected statTracker!: StatTracker;

  private readonly item: Item;

  constructor(
    options: Options & {
      abilities: Abilities;
      buffs: Buffs;
      castEfficiency: CastEfficiency;
      statTracker: StatTracker;
    },
  ) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.THE_FIRST_SIGIL.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    // Add the buffs to the buff tracker so that they show up in the timeline
    options.buffs.add({
      spellId: SPELLS.THE_FIRST_SIGIL.id,
      timelineHighlight: true,
      triggeredBySpellId: SPELLS.THE_FIRST_SIGIL.id,
    });

    // Add the main cast as an ability so that we can track cooldown and usage in timeline
    options.abilities.add({
      spell: SPELLS.THE_FIRST_SIGIL.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
  }

  private getCastEfficiency() {
    return (
      this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.THE_FIRST_SIGIL.id) ?? {
        casts: 0,
        maxCasts: 0,
      }
    );
  }

  statistic() {
    const { casts, maxCasts } = this.getCastEfficiency();
    // TODO track damage contribution and add to stat bar (should be easy because it's vers)
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.THE_FIRST_SIGIL}>
          {casts} Uses <small>{maxCasts} possible</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default TheFirstSigil;
