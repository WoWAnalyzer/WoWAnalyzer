import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Haste from 'interface/icons/Haste';
import { formatDuration, formatPercentage } from 'common/format';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import Buffs from 'parser/core/modules/Buffs';
import STAT from 'parser/shared/modules/features/STAT';
import Uptime from 'interface/icons/Uptime';

const DARKMOON_DECK_VORACITY_CARDS_INFO: Record<number, {name: string, hasteDrain: number, hastePercent: number, uptime: number}> = {
  [SPELLS.ACE_OF_VORACITY.id]: {
    name: 'Ace',
    hasteDrain: 239,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.TWO_OF_VORACITY.id]: {
    name: 'Two',
    hasteDrain: 253,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.THREE_OF_VORACITY.id]: {
    name: 'Three',
    hasteDrain: 267,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.FOUR_OF_VORACITY.id]: {
    name: 'Four',
    hasteDrain: 281,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.FIVE_OF_VORACITY.id]: {
    name: 'Five',
    hasteDrain: 295,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.SIX_OF_VORACITY.id]: {
    name: 'Six',
    hasteDrain: 309,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.SEVEN_OF_VORACITY.id]: {
    name: 'Seven',
    hasteDrain: 323,
    hastePercent: 0,
    uptime: 0,
  },
  [SPELLS.EIGHT_OF_VORACITY.id]: {
    name: 'Eight',
    hasteDrain: 337,
    hastePercent: 0,
    uptime: 0,
  },
};

const DARKMOON_DECK_VORACITY_CARDS = [SPELLS.ACE_OF_VORACITY, SPELLS.TWO_OF_VORACITY, SPELLS.THREE_OF_VORACITY, SPELLS.FOUR_OF_VORACITY, SPELLS.FIVE_OF_VORACITY, SPELLS.SIX_OF_VORACITY, SPELLS.SEVEN_OF_VORACITY, SPELLS.EIGHT_OF_VORACITY];

/**
 * Darkmoon Deck: Voracity
 * Use: Drain 288-407 Haste from the target and empowering yourself for the same.
 * The amount drained depends on the topmost card in the deck. Lasts 20 sec. (1 Min, 30 Sec Cooldown)
 * Equip: Periodically shuffle the deck while in combat.
 *
 * Example: https://www.warcraftlogs.com/reports/GFnfc92YT7xj6dkN/#fight=35&source=27&type=summary
 */
class DarkmoonDeckVoracity extends Analyzer {

  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
  };

  lastCard: { name: string; hasteDrain: number; } = { name: 'null', hasteDrain: 0 };
  lastCardId = 0;
  lastUseTimestamp = 0;

  protected abilities!: Abilities;
  protected statTracker!: StatTracker;
  protected buffs!: Buffs;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_VORACITY.id);
    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.VORACIOUS_HUNGER,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: 90,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    (options.buffs as Buffs).add({
      spellId: SPELLS.VORACIOUS_HASTE.id,
      timelineHighlight: true,
    });

    (options.statTracker as StatTracker).add(SPELLS.VORACIOUS_HASTE.id, {
      haste: this.lastCard.hasteDrain,
    });

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(DARKMOON_DECK_VORACITY_CARDS), this.removeCardBuff);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VORACIOUS_HASTE), this.applyHasteBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VORACIOUS_HASTE), this.removeHasteBuff);
  }

  removeCardBuff(event: RemoveBuffEvent) {
    this.lastCardId = event.ability.guid;
    this.lastCard = DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId];
  }

  applyHasteBuff(event: ApplyBuffEvent) {
    this.statTracker.update(SPELLS.VORACIOUS_HASTE.id, {
      haste: this.lastCard.hasteDrain,
    });
    if (!this.lastCardId || !DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId]) {
      return;
    }
    DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId].hastePercent += DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId].hasteDrain / this.statTracker.ratingNeededForNextPercentage(this.statTracker.currentHasteRating, this.statTracker.statBaselineRatingPerPercent[STAT.HASTE]);
    this.lastUseTimestamp = event.timestamp;
  }

  removeHasteBuff(event: RemoveBuffEvent) {
    if (!this.lastCardId || !DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId]) {
      return;
    }
    DARKMOON_DECK_VORACITY_CARDS_INFO[this.lastCardId].uptime = event.timestamp - this.lastUseTimestamp;
  }

  getTotals(deck: Array<{ name: string; hasteDrain: number; hastePercent: number; uptime: number; }>) {
    let totalUptime = 0;
    let totalPercent = 0;
    Object.values(deck).forEach((card) => {
      totalUptime += card.uptime;
      totalPercent += card.hastePercent;
    });
    return {
      totalUptime: totalUptime,
      totalPercent: totalPercent,
    };
  }

  getAverageHastePercentage(hastePercentage: number) {
    return hastePercentage * this.selectedCombatant.getBuffUptime(SPELLS.VORACIOUS_HASTE.id) / this.owner.fightDuration;
  }

  statistic() {
    const filtered = Object.values(DARKMOON_DECK_VORACITY_CARDS_INFO).filter(function(card) {
      if (card.uptime > 0) {
        return true;
      } else {
        return false;
      }
    });
    const darkmoondeckItem = {...ITEMS.DARKMOON_DECK_VORACITY, quality: 0, itemLevel: 0}
    const totals = this.getTotals(filtered);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Card</th>
                <th>Haste</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((card, index) => (
                <tr key={index}>
                  <td>{card.name}</td>
                  <td>{card.hasteDrain}</td>
                  <td>{formatDuration(card.uptime / 1000)}</td>
                  <td>{formatPercentage(card.uptime / this.owner.fightDuration)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringItemValueText item={darkmoondeckItem}>
          <Haste /> {formatPercentage(this.getAverageHastePercentage(totals.totalPercent))}% <small>Haste</small>
          <br />
          <Uptime /> {formatPercentage(totals.totalUptime / this.owner.fightDuration)}% <small>Uptime</small>
        </BoringItemValueText>
      </Statistic>
    );
  }

}

export default DarkmoonDeckVoracity;
