import ITEMS from 'common/ITEMS/dragonflight';
import SPELLS from 'common/SPELLS/dragonflight';
import { ItemLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SECONDARY_STAT, getIcon, getName } from 'parser/shared/modules/features/STAT';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { Fragment } from 'react';

const deps = {
  statTracker: StatTracker,
};

class ElementalLariat extends Analyzer.withDependencies(deps) {
  item!: Item;
  value!: number;
  gemCounts = {
    total: 0,
    air: 0,
    earth: 0,
    fire: 0,
    frost: 0,
  };

  constructor(options: Options) {
    super(options);

    const item = this.selectedCombatant.getItem(ITEMS.ELEMENTAL_LARIAT.id);
    if (item == null) {
      this.active = false;
      return;
    }
    this.item = item;

    this.value = calculateSecondaryStatDefault(350, 330, this.item.itemLevel);
    this.deps.statTracker.add(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_AIR.id, {
      haste: this.value,
    });
    this.deps.statTracker.add(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_EARTH.id, {
      mastery: this.value,
    });
    this.deps.statTracker.add(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FLAME.id, {
      crit: this.value,
    });
    this.deps.statTracker.add(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FROST.id, {
      versatility: this.value,
    });

    const allGems = this.selectedCombatant.gear.flatMap(({ gems }) => gems ?? []);

    for (const gem of allGems) {
      switch (gem.id) {
        case ITEMS.CRAFTY_ALEXSTRASZITE_R1.id:
        case ITEMS.CRAFTY_ALEXSTRASZITE_R2.id:
        case ITEMS.CRAFTY_ALEXSTRASZITE_R3.id:
        case ITEMS.ENERGIZED_MALYGITE_R1.id:
        case ITEMS.ENERGIZED_MALYGITE_R2.id:
        case ITEMS.ENERGIZED_MALYGITE_R3.id:
        case ITEMS.QUICK_YSEMERALD_R1.id:
        case ITEMS.QUICK_YSEMERALD_R2.id:
        case ITEMS.QUICK_YSEMERALD_R3.id:
        case ITEMS.KEEN_NELTHARITE_R1.id:
        case ITEMS.KEEN_NELTHARITE_R2.id:
        case ITEMS.KEEN_NELTHARITE_R3.id:
        case ITEMS.FORCEFUL_NOZDORITE_R1.id:
        case ITEMS.FORCEFUL_NOZDORITE_R2.id:
        case ITEMS.FORCEFUL_NOZDORITE_R3.id:
          this.gemCounts.total += 1;
          this.gemCounts.air += 1;
          break;
        case ITEMS.SENSEIS_ALEXSTRASZITE_R1.id:
        case ITEMS.SENSEIS_ALEXSTRASZITE_R2.id:
        case ITEMS.SENSEIS_ALEXSTRASZITE_R3.id:
        case ITEMS.ZEN_MALYGITE_R1.id:
        case ITEMS.ZEN_MALYGITE_R2.id:
        case ITEMS.ZEN_MALYGITE_R3.id:
        case ITEMS.KEEN_YSEMERALD_R1.id:
        case ITEMS.KEEN_YSEMERALD_R2.id:
        case ITEMS.KEEN_YSEMERALD_R3.id:
        case ITEMS.FRACTURED_NELTHARITE_R1.id:
        case ITEMS.FRACTURED_NELTHARITE_R2.id:
        case ITEMS.FRACTURED_NELTHARITE_R3.id:
        case ITEMS.PUISSANT_NOZDORITE_R1.id:
        case ITEMS.PUISSANT_NOZDORITE_R2.id:
        case ITEMS.PUISSANT_NOZDORITE_R3.id:
          this.gemCounts.total += 1;
          this.gemCounts.earth += 1;
          break;
        case ITEMS.DEADLY_ALEXSTRASZITE_R1.id:
        case ITEMS.DEADLY_ALEXSTRASZITE_R2.id:
        case ITEMS.DEADLY_ALEXSTRASZITE_R3.id:
        case ITEMS.RADIANT_MALYGITE_R1.id:
        case ITEMS.RADIANT_MALYGITE_R2.id:
        case ITEMS.RADIANT_MALYGITE_R3.id:
        case ITEMS.CRAFTY_YSEMERALD_R1.id:
        case ITEMS.CRAFTY_YSEMERALD_R2.id:
        case ITEMS.CRAFTY_YSEMERALD_R3.id:
        case ITEMS.SENSEIS_NELTHARITE_R1.id:
        case ITEMS.SENSEIS_NELTHARITE_R2.id:
        case ITEMS.SENSEIS_NELTHARITE_R3.id:
        case ITEMS.JAGGED_NOZDORITE_R1.id:
        case ITEMS.JAGGED_NOZDORITE_R2.id:
        case ITEMS.JAGGED_NOZDORITE_R3.id:
          this.gemCounts.total += 1;
          this.gemCounts.fire += 1;
          break;
        case ITEMS.RADIANT_ALEXSTRASZITE_R1.id:
        case ITEMS.RADIANT_ALEXSTRASZITE_R2.id:
        case ITEMS.RADIANT_ALEXSTRASZITE_R3.id:
        case ITEMS.STORMY_MALYGITE_R1.id:
        case ITEMS.STORMY_MALYGITE_R2.id:
        case ITEMS.STORMY_MALYGITE_R3.id:
        case ITEMS.ENERGIZED_YSEMERALD_R1.id:
        case ITEMS.ENERGIZED_YSEMERALD_R2.id:
        case ITEMS.ENERGIZED_YSEMERALD_R3.id:
        case ITEMS.ZEN_NELTHARITE_R1.id:
        case ITEMS.ZEN_NELTHARITE_R2.id:
        case ITEMS.ZEN_NELTHARITE_R3.id:
        case ITEMS.STEADY_NOZDORITE_R1.id:
        case ITEMS.STEADY_NOZDORITE_R2.id:
        case ITEMS.STEADY_NOZDORITE_R3.id:
          this.gemCounts.total += 1;
          this.gemCounts.frost += 1;
          break;
        default:
          break;
      }
    }

    console.log(this.gemCounts);
  }

  tooltip(averageBenefits: { stat: SECONDARY_STAT; averageBenefit: number }[]) {
    const totalTriggers =
      this.selectedCombatant.getBuffTriggerCount(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_AIR.id) +
      this.selectedCombatant.getBuffTriggerCount(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_EARTH.id) +
      this.selectedCombatant.getBuffTriggerCount(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FLAME.id) +
      this.selectedCombatant.getBuffTriggerCount(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FROST.id);

    const gemChance = [
      {
        type: 'Air',
        stat: SECONDARY_STAT.HASTE,
        count: this.gemCounts.air,
        chance: this.gemCounts.air / this.gemCounts.total,
      },
      {
        type: 'Earth',
        stat: SECONDARY_STAT.MASTERY,
        count: this.gemCounts.earth,
        chance: this.gemCounts.earth / this.gemCounts.total,
      },
      {
        type: 'Fire',
        stat: SECONDARY_STAT.CRITICAL_STRIKE,
        count: this.gemCounts.fire,
        chance: this.gemCounts.fire / this.gemCounts.total,
      },
      {
        type: 'Frost',
        stat: SECONDARY_STAT.VERSATILITY,
        count: this.gemCounts.frost,
        chance: this.gemCounts.frost / this.gemCounts.total,
      },
    ]
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.chance - a.chance)
      .map(({ type, stat, count, chance }, index, list) => (
        <Fragment key={type}>
          {index > 0 && ', '}
          {index === list.length - 1 && 'and '}
          {count} {type} gems resulting in a {Math.round(chance * 100)}% chance to proc{' '}
          {getName(stat)}
        </Fragment>
      ));

    return (
      <>
        <div>
          <ItemLink id={this.item.id} quality={this.item.quality} details={this.item} /> proced{' '}
          {totalTriggers} times, this means you benefited an average of{' '}
          {averageBenefits
            .map(({ stat, averageBenefit }) => `${Math.round(averageBenefit)} ${getName(stat)}`)
            .join(', ')}{' '}
          over the duration of the fight.
        </div>

        <div>
          You have {gemChance}. You have {this.gemCounts.total} elemental gems, resulting in a buff
          duration of {5 + this.gemCounts.total} seconds.
        </div>
      </>
    );
  }

  statistic() {
    const averageBenefits = [
      {
        stat: SECONDARY_STAT.HASTE,
        uptime: this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_AIR.id),
      },
      {
        stat: SECONDARY_STAT.MASTERY,
        uptime: this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_EARTH.id),
      },
      {
        stat: SECONDARY_STAT.CRITICAL_STRIKE,
        uptime: this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FLAME.id),
      },
      {
        stat: SECONDARY_STAT.VERSATILITY,
        uptime: this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_LARIAT_EMPOWERED_FROST.id),
      },
    ]
      .filter(({ uptime }) => uptime > 0)
      .sort((a, b) => b.uptime - a.uptime)
      .map(({ stat, uptime }) => ({
        stat,
        averageBenefit: (uptime / this.owner.fightDuration) * this.value,
      }));

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={this.tooltip(averageBenefits)}
      >
        <BoringItemValueText item={this.item}>
          {averageBenefits.length < 1 && 'No procs'}
          {averageBenefits.map(({ stat, averageBenefit }) => {
            const StatIcon = getIcon(stat);
            return (
              <div key={stat}>
                <StatIcon /> {Math.round(averageBenefit)} <small>{getName(stat)} over time</small>
              </div>
            );
          })}
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default ElementalLariat;
