import { Enchant } from 'common/ITEMS/Item';
import Spell from 'common/SPELLS/Spell';
import QualityIcon from 'interface/QualityIcon';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { ReactNode } from 'react';

export interface EnchantRank {
  rank: number;
  enchant: Enchant;
}

class WeaponEnchantAnalyzer<R extends EnchantRank = EnchantRank> extends Analyzer {
  /**
   * Used for tooltips and links. Should be the spell with the "X procs per minute" tooltip.
   */
  protected enchantSpell: Spell;
  protected ranks: R[];

  protected mainHand: R | null = null;
  protected offHand: R | null = null;

  /**
   * Creates a new {@link WeaponEnchantAnalyzer} for the specified {@link enchantSpell}
   * @param enchantSpell spell to use for {@link SpellLink}
   * @param ranks quality ranks
   * @param options analyzer options
   */
  constructor(enchantSpell: Spell, ranks: R[], options: Options) {
    super(options);
    this.enchantSpell = enchantSpell;
    this.ranks = ranks;

    const { mainHand, offHand } = this.selectedCombatant;
    this.mainHand = this.getRank(mainHand);
    this.offHand = this.getRank(offHand);

    this.active = this.mainHand != null || this.offHand != null;
  }

  private getRank(weapon: Item | undefined): R | null {
    return (
      this.ranks.find((effect) => effect.enchant.effectId === weapon?.permanentEnchant) || null
    );
  }

  /**
   * Output the quality icon(s) for your weapon enchant(s).
   */
  protected qualityIcons(): ReactNode {
    return (
      <>
        {(this.mainHand?.rank === 1 || this.offHand?.rank === 1) && <QualityIcon quality={1} />}
        {(this.mainHand?.rank === 2 || this.offHand?.rank === 2) && <QualityIcon quality={2} />}
        {(this.mainHand?.rank === 3 || this.offHand?.rank === 3) && <QualityIcon quality={3} />}
      </>
    );
  }

  /** Outputs basic information about the enchant, the number of procs, and the PPM */
  protected procCount(count: number): ReactNode {
    return (
      <>
        <SpellLink spell={this.enchantSpell} /> {this.qualityIcons()} triggered{' '}
        <strong>{count}</strong> times, {this.owner.getPerMinute(count).toFixed(1)} procs per minute
      </>
    );
  }

  /**
   * Implement to provide the parts of a statistic as parts.
   *
   * This let's us share the "wrapper" around the statistic, but still provide
   * the content, tooltip, and dropdown.
   */
  protected statisticParts(): {
    content: ReactNode;
    tooltip?: ReactNode;
    dropdown?: ReactNode;
  } {
    return {
      content: null,
    };
  }

  statistic() {
    const { content, tooltip, dropdown } = this.statisticParts();

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={tooltip}
        dropdown={dropdown}
      >
        <div className="pad boring-text">
          <label>
            <SpellIcon spell={this.enchantSpell} />{' '}
            <SpellLink spell={this.enchantSpell} icon={false} /> {this.qualityIcons()}
          </label>
          <div className="value">{content}</div>
        </div>
      </Statistic>
    );
  }
}

export default WeaponEnchantAnalyzer;
