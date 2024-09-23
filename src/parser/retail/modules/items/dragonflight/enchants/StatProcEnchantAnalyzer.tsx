import Spell from 'common/SPELLS/Spell';
import { formatDuration, formatPercentage } from 'common/format';
import QualityIcon from 'interface/QualityIcon';
import { Options } from 'parser/core/EventSubscriber';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getIcon, getName } from 'parser/shared/modules/features/STAT';
import WeaponEnchantAnalyzer, { EnchantRank } from '../../WeaponEnchantAnalyzer';
import { withDependencies } from 'parser/core/Analyzer';

/**
 * Export to reuse between the various secondary stat proc enchants.
 */
export const SECONDARY_STAT_WRIT_VALUES = {
  1: 1185.67,
  2: 1209.09,
  3: 1394.51,
} as const;

interface StatProcEnchantRank extends EnchantRank {
  amount: number;
}

const deps = { statTracker: StatTracker };

/**
 * Abstraction to reuse the same code for tracking stats from procing enchants such as
 * writs and Sophic Devotion.
 */
abstract class StatProcEnchantAnalyzer extends withDependencies(
  WeaponEnchantAnalyzer<StatProcEnchantRank>,
  deps,
) {
  /** The stat that the enchant provides on proc */
  protected stat: STAT;
  protected buff: Spell;

  constructor(
    stat: STAT,
    enchantSpell: Spell,
    buff: Spell,
    ranks: StatProcEnchantRank[],
    options: Options,
  ) {
    super(enchantSpell, ranks, options);
    this.deps.statTracker = (options as Options & { statTracker: StatTracker }).statTracker;
    this.stat = stat;
    this.buff = buff;

    if (!this.active) {
      return;
    }

    this.deps.statTracker.add(this.buff.id, {
      [this.stat]: this.sumValue(),
    });
  }

  protected sumValue(): number {
    return (this.mainHand?.amount ?? 0) + (this.offHand?.amount ?? 0);
  }

  protected statisticParts() {
    const StatIcon = getIcon(this.stat);
    const statName = getName(this.stat);
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(this.buff.id);
    const totalAmount = this.sumValue();
    const uptime = this.selectedCombatant.getBuffUptime(this.buff.id);
    const uptimePercentage = uptime / this.owner.fightDuration;
    const calculatedAverage = Math.round(totalAmount * uptimePercentage);

    const valueExplanation =
      this.mainHand != null && this.offHand != null ? (
        <>
          <b>{Math.round(this.mainHand.amount)}</b> (main hand{' '}
          <QualityIcon quality={this.mainHand.rank} />) + <b>{Math.round(this.offHand.amount)}</b>{' '}
          (off hand <QualityIcon quality={this.offHand.rank} />)
        </>
      ) : (
        <b>{Math.round(totalAmount)}</b>
      );

    return {
      tooltip: (
        <>
          {this.procCount(totalProcs)}
          <br />
          The buff gives {valueExplanation} {statName}, and had a total uptime of{' '}
          <b>{formatDuration(uptime)}</b>, {formatPercentage(uptimePercentage, 1)}% of the fight.
          This means over time you benefited an average of <b>{calculatedAverage}</b> {statName}{' '}
          from this enchant.
        </>
      ),
      content: (
        <>
          <StatIcon /> {calculatedAverage} <small>{statName} over time</small>
        </>
      ),
    };
  }
}

export default StatProcEnchantAnalyzer;
