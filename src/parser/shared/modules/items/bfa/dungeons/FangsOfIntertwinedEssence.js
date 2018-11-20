import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import ItemManaGained from 'interface/others/ItemManaGained';

const MAX_RESTORES_PER_USE = 6;
const ACTIVATION_COOLDOWN = 120; // seconds
const BUFF_DURATION = 20; // seconds

/**
 * Use: Your next 6 healing spells restore [x] mana. (2 Min Cooldown)
 * 
 * The restored mana appears as energize events in the combat log.
 * The buff expires after 20 seconds or after casting 6 spells, whichever is sooner.
 */
class FangsOfIntertwinedEssence extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  }

  manaRestored = 0;
  useCount = 0;
  restoreCount = 0;
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.FANGS_OF_INTERTWINED_ESSENCE.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.FANGS_OF_INTERTWINED_ESSENCE_BUFF,
        name: ITEMS.FANGS_OF_INTERTWINED_ESSENCE.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: ACTIVATION_COOLDOWN,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_toPlayer_applybuff(event) {
    if (SPELLS.FANGS_OF_INTERTWINED_ESSENCE_BUFF.id !== event.ability.guid) {
      return;
    }
    this.useCount += 1;
  }

  on_toPlayer_energize(event) {
    if (SPELLS.FANGS_OF_INTERTWINED_ESSENCE_ENERGIZE.id !== event.ability.guid) {
      return;
    }
    this.restoreCount += 1;
    this.manaRestored += event.resourceChange;
  }

  get possibleUseCount() {
    return 1 + Math.floor(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
  }

  get restoresPerUse() {
    return this.restoreCount / this.useCount;
  }
  
  item() {
    return {
      item: ITEMS.FANGS_OF_INTERTWINED_ESSENCE,
      result: (
        <dfn data-tip={`Activated <b>${this.useCount}</b> time${this.useCount === 1 ? '' : 's'} of a possible <b>${this.possibleUseCount}</b>.<br />
          You cast an average of <b>${this.restoresPerUse.toFixed(1)}</b> eligible spells during each activation, out of a possible <b>${MAX_RESTORES_PER_USE}</b>.`}>
          <ItemManaGained amount={this.manaRestored} />
        </dfn>
      ),
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.restoresPerUse / MAX_RESTORES_PER_USE,
      isLessThan: {
        minor: 1.0,
        average: 0.8,
        major: 0.5,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your usage of <ItemLink id={ITEMS.FANGS_OF_INTERTWINED_ESSENCE.id} /> can be improved. Try to cast at least {MAX_RESTORES_PER_USE} spells in the {BUFF_DURATION} seconds after activating it to benefit from the full mana restoration it can provide.
        </>
      )
        .icon(ITEMS.FANGS_OF_INTERTWINED_ESSENCE.icon)
        .actual(`${formatPercentage(actual)}% of mana restoration triggered`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default FangsOfIntertwinedEssence;
