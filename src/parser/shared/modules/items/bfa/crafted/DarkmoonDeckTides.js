import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemManaGained from 'interface/ItemManaGained';
import Events from 'parser/core/Events';

const DARKMOON_DECK_TIDES_CARDS = [
  276136, // Ace
  276137, // 2
  276138, // 3
  276139, // 4
  276140, // 5
  276141, // 6
  276142, // 7
  276143, // 8
];

/**
 * Darkmoon Deck: Tides -
 * Equip: Restores a moderate amount of mana when the deck is shuffled. Chance to throw a card to a random party member,
 * healing them and bouncing to other party members. Amount of mana restored and number of bounces depends on the topmost card in the deck.
 * Equip: Periodically shuffle the deck while in combat.
 *
 * Test Log: https://www.warcraftlogs.com/reports/CadGJw7KZpq9Xgnb#fight=4&type=damage-done&source=60
 */

class DarkmoonDeckTides extends Analyzer {
  healing = 0;
  manaGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_TIDES.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATING_TIDES), this.onHeal);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.onEnergize);
  }

  onHeal(event) {

    this.healing += event.amount + (event.absorbed || 0);
  }

  onEnergize(event) {
    const spellId = event.ability.guid;
    if (!DARKMOON_DECK_TIDES_CARDS.includes(spellId)) {
      return;
    }

    this.manaGained += event.resourceChange;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.DARKMOON_DECK_TIDES}>
          <ItemHealingDone amount={this.healing} /><br />
          <ItemManaGained amount={this.manaGained} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default DarkmoonDeckTides;
