import { Enchant } from 'common/ITEMS/Item';
import { Item } from 'parser/core/Events';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { GearSlotName } from 'parser/core/Combatant';
import { ReactNode } from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';

export type AnySlot = 'any-slot';
export type EmbellishmentSlot = GearSlotName | GearSlotName[] | AnySlot;

class EmbellishmentAnalyzer extends Analyzer {
  protected embellishment: Enchant;
  protected slot: Item[];

  constructor(embellishment: Enchant, slot: EmbellishmentSlot, options: Options) {
    super(options);
    this.embellishment = embellishment;
    this.slot = this.getItemSlots(this.embellishment.effectId, slot);
    this.active = this.slot.length > 0;
  }

  protected getItemSlots(effectId: number, slot: EmbellishmentSlot): Item[] {
    if (slot === 'any-slot') {
      return this.selectedCombatant.gear.filter((item) => this.checkItemBonusIds(effectId, item));
    }
    if (Array.isArray(slot)) {
      return slot.flatMap((s) => this.getItemSlots(effectId, s));
    }
    const item = this.selectedCombatant.getGear(slot);
    return item && this.checkItemBonusIds(effectId, item) ? [item] : [];
  }

  protected checkItemBonusIds(effectId: number, item: Item): boolean {
    if (typeof item.bonusIDs === 'number') {
      return item.bonusIDs === effectId;
    } else {
      return item.bonusIDs?.some((bonusId) => bonusId === effectId) ?? false;
    }
  }

  protected procCount(count: number): ReactNode {
    return (
      <>
        <SpellLink spell={this.embellishment} /> triggered <strong>{count}</strong> times,{' '}
        {this.owner.getPerMinute(count).toFixed(1)} procs per minute
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
            <SpellIcon spell={this.embellishment} />{' '}
            <SpellLink spell={this.embellishment} icon={false} />
          </label>
          <div className="value">{content}</div>
        </div>
      </Statistic>
    );
  }
}

export default EmbellishmentAnalyzer;
