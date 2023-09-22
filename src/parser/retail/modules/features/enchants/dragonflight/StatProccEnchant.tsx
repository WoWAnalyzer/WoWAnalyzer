import { Enchant } from 'common/ITEMS/Item';
import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/EventSubscriber';
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
  protected statTracker!: StatTracker;

  /** The stat that the enchant provides on procc */
  protected stat: STAT;
  protected buff: Spell;
  /** The amount provided each time it proccs */
  protected amount = 0;

  constructor(stat: STAT, buff: Spell, ranks: Rank[], options: Options) {
    super(options);
    this.statTracker = (options as Options & { statTracker: StatTracker }).statTracker;
    this.stat = stat;
    this.buff = buff;

    this.active = ranks.some((effect) => this.selectedCombatant.hasWeaponEnchant(effect.enchant));
    if (!this.active) {
      return;
    }
    const { mainHand, offHand } = this.selectedCombatant;

    [mainHand.permanentEnchant, offHand.permanentEnchant].forEach((enchantId) => {
      const effect = ranks.find((e) => e.enchant.effectId === enchantId);
      if (effect) {
        this.amount += effect.amount;
      }
    });

    this.statTracker.add(this.buff.id, {
      [this.stat]: this.amount,
    });
  }

  statistic() {
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(this.buff.id);
    const ppm = (totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1);
    const uptime = this.selectedCombatant.getBuffUptime(this.buff.id) / this.owner.fightDuration;
    const Icon = getIcon(this.stat);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={this.buff} /> triggered {totalProcs} times ({ppm} procs per minute),
            giving {Math.round(this.amount)} {getName(this.stat)} every time.
          </>
        }
      >
        <BoringSpellValueText spell={this.buff}>
          <Icon /> {Math.round(this.amount * uptime)} <small>{getName(this.stat)} on average</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StatProccEnchant;
