import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { calculatePrimaryStat } from 'common/stats';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import ItemIcon from 'common/ItemIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';

const DARKMOON_DECK_BLOCKADES_CARDS = {
  276204: {
    name: "Ace",
    staminaIncrease: 72,
  },
  276205: {
    name: "Two",
    staminaIncrease: 146,
  },
  276206: {
    name: "Three",
    staminaIncrease: 218,
  },
  276207: {
    name: "Four",
    staminaIncrease: 291,
  },
  276208: {
    name: "Five",
    staminaIncrease: 364,
  },
  276209: {
    name: "Six",
    staminaIncrease: 437,
  },
  276210: {
    name: "Seven",
    staminaIncrease: 510,
  },
  276211: {
    name: "Eight",
    staminaIncrease: 583,
  },
};

/**
 * Darkmoon Deck: Blockades
 * Equip: Whenever the deck is shuffled, heal a small amount of health and gain additional stamina. Amount of both stamina and healing depends on the topmost card of the deck.
 * Equip: Periodically shuffle the deck while in combat.
 *
 * Example: https://www.warcraftlogs.com/reports/j7XQrN8LcJKw1qM3#fight=29&source=1&type=healing&view=timeline
 */

class DarkmoonDeckBlockades extends Analyzer {
  healing = 0;
  actualStaminaIncreasePerCard = {};
  cardTracker = {};

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_BLOCKADES.id);
    if (this.active) {
      Object.keys(DARKMOON_DECK_BLOCKADES_CARDS).forEach((buffId) => {
        const defaultCard = DARKMOON_DECK_BLOCKADES_CARDS[buffId];
        const actualStaminaIncrease = calculatePrimaryStat(355, defaultCard.staminaIncrease, this.selectedCombatant.getItem(ITEMS.DARKMOON_DECK_BLOCKADES.id).itemLevel);
        this.actualStaminaIncreasePerCard[buffId] = actualStaminaIncrease;
      });
    }
  }

  _isBlockadesCard(spellId) {
    const cardId = '' + spellId;
    const darkmoonSpells = Object.keys(DARKMOON_DECK_BLOCKADES_CARDS);
    return darkmoonSpells.includes(cardId);
  }

  on_byPlayer_heal(event) {
    if (!this._isBlockadesCard(event.ability.guid)) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (!this._isBlockadesCard(spellId)) {
      return;
    }
    if (!this.cardTracker.hasOwnProperty(spellId)) {
      this.cardTracker[spellId] = [];
    }
    this.cardTracker[spellId].push({
      start: event.timestamp,
      end: this.owner.fight.end_time,
    });
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (!this._isBlockadesCard(spellId)) {
      return;
    }
    if (!this.cardTracker.hasOwnProperty(spellId)) {
      return;
    }
    const lastOccurrenceOfThisCard = this.cardTracker[spellId].pop();
    lastOccurrenceOfThisCard.end = event.timestamp;
    this.cardTracker[spellId].push(lastOccurrenceOfThisCard);
  }

  _getStaminaSummary() {
    const summary = {};
    Object.keys(this.cardTracker).forEach((cardId) => {
      const card = this.cardTracker[cardId];
      let duration = 0;
      card.forEach((occurrence) => {
        duration += occurrence.end - occurrence.start;
      });
      summary[cardId] = {
        name: DARKMOON_DECK_BLOCKADES_CARDS[cardId].name,
        occurrences: card.length,
        duration: duration,
        staminaIncrease: this.actualStaminaIncreasePerCard[cardId],
      };
    });
    return summary;
  }

  _getSummaryTotals(summary) {
    let totalDuration = 0;
    let totaloccurrences = 0;
    let totalStaminaIncrease = 0;
    Object.keys(summary).forEach((cardId) => {
      const entry = summary[cardId];
      totalDuration += entry.duration;
      totaloccurrences += entry.occurrences;
      totalStaminaIncrease += entry.staminaIncrease * entry.duration;
    });
    return {
      totalDuration: totalDuration,
      totaloccurrences: totaloccurrences,
      averageStaminaIncrease: totalStaminaIncrease / totalDuration,
    };
  }

  item() {
    const summary = this._getStaminaSummary();
    const totals = this._getSummaryTotals(summary);
    const tooltipData = (
      <ExpandableStatisticBox
        icon={<ItemIcon id={ITEMS.DARKMOON_DECK_BLOCKADES.id} />}
        value=""
        label={<ItemHealingDone amount={this.healing} />}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stamina</th>
              <th>Procs</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(summary).map((card, index) => (
              <tr key={index}>
                <td>{card.name}</td>
                <th>{card.staminaIncrease}</th>
                <td>{card.occurrences}</td>
                <td>{formatDuration(card.duration / 1000)}</td>
                <td>{formatPercentage(card.duration / this.owner.fightDuration)}%</td>
              </tr>
            ))}
            <tr key="total">
              <th>Total</th>
              <th>{formatNumber(totals.averageStaminaIncrease)}</th>
              <td>{totals.totaloccurrences}</td>
              <td>{formatDuration(totals.totalDuration / 1000)}</td>
              <td>{formatPercentage(totals.totalDuration / this.owner.fightDuration)}%</td>
            </tr>
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
    return tooltipData;
  }
}

export default DarkmoonDeckBlockades;
