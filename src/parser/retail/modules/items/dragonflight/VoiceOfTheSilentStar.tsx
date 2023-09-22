import Analyzer, { Options } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

class VoiceOfTheSilentStar extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  secondaryValue: number = 0;
  highestSecondary: string | number = 'none';

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasBack(ITEMS.VOICE_OF_THE_SILENT_STAR.id);
    if (!this.active) {
      return;
    }
    const cloak = this.selectedCombatant.back;
    this.secondaryValue = calculateSecondaryStatDefault(431, 2235.71, cloak.itemLevel);

    const statTracker = options.statTracker as StatTracker;
    const statList = [
      { name: 'haste', value: statTracker.currentHasteRating },
      { name: 'mastery', value: statTracker.currentMasteryRating },
      { name: 'crit', value: statTracker.currentCritRating },
      { name: 'vers', value: statTracker.currentVersatilityRating },
    ];
    statList.sort((a, b) => b.value - a.value);
    this.highestSecondary = statList[0].name;
    if (this.highestSecondary === 'haste') {
      statTracker.add(SPELLS.POWER_BEYOND_IMAGINATION.id, {
        haste: this.secondaryValue,
      });
    } else if (this.highestSecondary === 'crit') {
      statTracker.add(SPELLS.POWER_BEYOND_IMAGINATION.id, {
        crit: this.secondaryValue,
      });
    } else if (this.highestSecondary === 'vers') {
      statTracker.add(SPELLS.POWER_BEYOND_IMAGINATION.id, {
        versatility: this.secondaryValue,
      });
    } else {
      statTracker.add(SPELLS.POWER_BEYOND_IMAGINATION.id, {
        mastery: this.secondaryValue,
      });
    }
  }
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.POWER_BEYOND_IMAGINATION.id) /
      this.owner.fightDuration
    );
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.VOICE_OF_THE_SILENT_STAR}>
          {formatNumber(this.secondaryValue * this.uptime)} {this.highestSecondary}
          <small> gained on average</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default VoiceOfTheSilentStar;
