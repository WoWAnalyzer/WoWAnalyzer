import { Enchant } from 'common/ITEMS/Item';
import Spell from 'common/SPELLS/Spell';
import { formatDuration, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/EventSubscriber';
import { Item } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getIcon, getName } from 'parser/shared/modules/features/STAT';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

/**
 * Export to reuse between the various secondary stat procc enchants.
 */
export const SECONDARY_STAT_WRIT_VALUES = {
  1: 1185.67,
  2: 1209.09,
  3: 1394.51,
} as const;

interface Rank {
  enchant: Enchant;
  amount: number;
}

/**
 * Abstraction to reuse the same code for tracking stats from proccing enchants such as
 * writs and Sophic Devotion.
 */
abstract class StatProccEnchant extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  statTracker!: StatTracker;

  /** The stat that the enchant provides on procc */
  protected stat: STAT;
  protected enchantSpell: Spell;
  protected buff: Spell;
  protected ranks: Rank[];
  private mainHandAmount = 0;
  private offHandAmount = 0;

  constructor(stat: STAT, enchantSpell: Spell, buff: Spell, ranks: Rank[], options: Options) {
    super(options);
    this.statTracker = (options as Options & { statTracker: StatTracker }).statTracker;
    this.stat = stat;
    this.enchantSpell = enchantSpell;
    this.buff = buff;
    this.ranks = ranks;

    this.active = this.ranks.some((effect) =>
      this.selectedCombatant.hasWeaponEnchant(effect.enchant),
    );
    if (!this.active) {
      return;
    }
    const { mainHand, offHand } = this.selectedCombatant;

    this.mainHandAmount = this.getEnchantAmount(mainHand);
    this.offHandAmount = this.getEnchantAmount(offHand);

    this.statTracker.add(this.buff.id, {
      [this.stat]: this.mainHandAmount + this.offHandAmount,
    });
  }

  private getEnchantAmount(weapon: Item) {
    const rank = this.ranks.find((effect) => effect.enchant.effectId === weapon.permanentEnchant);
    return rank?.amount || 0;
  }

  statistic() {
    const StatIcon = getIcon(this.stat);
    const statName = getName(this.stat);
    const totalAmount = this.mainHandAmount + this.offHandAmount;
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(this.buff.id);
    const ppm = this.owner.getPerMinute(totalProcs).toFixed(1);
    const uptime = this.selectedCombatant.getBuffUptime(this.buff.id);
    const uptimePercentage = uptime / this.owner.fightDuration;
    const calculatedAverage = Math.round(totalAmount * uptimePercentage);

    const valueExplanation =
      this.mainHandAmount !== 0 && this.offHandAmount !== 0 ? (
        <>
          <b>{Math.round(this.mainHandAmount)}</b> (main hand) +{' '}
          <b>{Math.round(this.offHandAmount)}</b> (off hand)
        </>
      ) : (
        <b>{Math.round(totalAmount)}</b>
      );

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={this.enchantSpell} /> triggered <b>{totalProcs}</b> times ({ppm} procs
            per minute). The buff gives {valueExplanation} {statName}, and had a total uptime of{' '}
            <b>{formatDuration(uptime)}</b>, {formatPercentage(uptimePercentage, 1)}% of the fight.
            This means over time you benefited an average of <b>{calculatedAverage}</b> {statName}{' '}
            from this enchant.
          </>
        }
      >
        <BoringSpellValueText spell={this.enchantSpell}>
          <StatIcon /> {calculatedAverage} <small>{statName} over time</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StatProccEnchant;
