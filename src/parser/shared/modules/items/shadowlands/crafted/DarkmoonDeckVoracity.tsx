import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Haste from 'interface/icons/Haste';
import { formatPercentage } from 'common/format';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import Buffs from 'parser/core/modules/Buffs';

const DARKMOON_DECK_VORACITY_CARDS_INFO = {
  [SPELLS.ACE_OF_VORACITY.id]: {
    name: 'Ace',
    hasteDrain: 288,
  },
  [SPELLS.TWO_OF_VORACITY.id]: {
    name: 'Two',
    hasteDrain: 305,
  },
  [SPELLS.THREE_OF_VORACITY.id]: {
    name: 'Three',
    hasteDrain: 322,
  },
  [SPELLS.FOUR_OF_VORACITY.id]: {
    name: 'Four',
    hasteDrain: 339,
  },
  [SPELLS.FIVE_OF_VORACITY.id]: {
    name: 'Five',
    hasteDrain: 356,
  },
  [SPELLS.SIX_OF_VORACITY.id]: {
    name: 'Six',
    hasteDrain: 373,
  },
  [SPELLS.SEVEN_OF_VORACITY.id]: {
    name: 'Seven',
    hasteDrain: 390,
  },
  [SPELLS.EIGHT_OF_VORACITY.id]: {
    name: 'Eight',
    hasteDrain: 407,
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

  gainedHaste = 0;
  lastCard: { name: string; hasteDrain: number; } = { name: 'null', hasteDrain: 0 };

  protected abilities!: Abilities;
  protected statTracker!: StatTracker;

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
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
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
  }

  removeCardBuff(event: RemoveBuffEvent) {
    this.lastCard = DARKMOON_DECK_VORACITY_CARDS_INFO[event.ability.guid];
  }

  applyHasteBuff(event: ApplyBuffEvent) {
    this.statTracker.update(SPELLS.VORACIOUS_HASTE.id, {
      haste: this.lastCard.hasteDrain,
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.DARKMOON_DECK_VORACITY}>
          <Haste /> {formatPercentage(0.1)}% <small>Haste</small>
        </BoringItemValueText>
      </Statistic>
    );
  }

}

export default DarkmoonDeckVoracity;
