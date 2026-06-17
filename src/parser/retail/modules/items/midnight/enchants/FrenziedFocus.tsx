import ITEMS from 'common/ITEMS/midnight/enchants';
import SPELLS from 'common/SPELLS/midnight/enchants';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getIcon, getName } from 'parser/shared/modules/features/STAT';
import WeaponEnchantAnalyzer, { EnchantRank } from '../../WeaponEnchantAnalyzer';

interface FrenziedFocusRank extends EnchantRank {
  amount: number;
}

const RANKS: FrenziedFocusRank[] = [
  { rank: 1, enchant: ITEMS.WEAPON_BERSERKERS_RAGE_R1, amount: 100 },
  { rank: 2, enchant: ITEMS.WEAPON_BERSERKERS_RAGE_R2, amount: 125 },
];

export default class FrenziedFocus extends WeaponEnchantAnalyzer.withDependencies({
  statTracker: StatTracker,
}) {
  constructor(options: Options) {
    super(SPELLS.FRENZIED_FOCUS, RANKS, options);

    if (!this.active) {
      return;
    }

    this.deps.statTracker.add(SPELLS.FRENZIED_FOCUS.id, {
      haste: this.hasteAmount,
    });
  }

  private get hasteAmount(): number {
    const highestRank = Math.max(this.mainHand?.rank ?? 0, this.offHand?.rank ?? 0);
    return RANKS.find((rank) => rank.rank === highestRank)?.amount ?? 0;
  }

  protected statisticParts() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.FRENZIED_FOCUS.id);
    const uptimePercentage = uptime / this.owner.fightDuration;
    const calculatedAverage = Math.round(this.hasteAmount * uptimePercentage);
    const StatIcon = getIcon(STAT.HASTE);
    const statName = getName(STAT.HASTE);

    return {
      tooltip: (
        <>
          <strong>{formatNumber(this.hasteAmount)}</strong> {statName} with{' '}
          <strong>{formatDuration(uptime)}</strong> uptime, {formatPercentage(uptimePercentage, 1)}%
          of the fight.
        </>
      ),
      content: (
        <>
          <StatIcon /> {formatNumber(calculatedAverage)} <small>{statName} over time</small>
        </>
      ),
    };
  }
}
