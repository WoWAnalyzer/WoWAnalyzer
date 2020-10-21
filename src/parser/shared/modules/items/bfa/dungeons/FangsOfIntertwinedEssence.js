import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import ItemManaGained from 'interface/ItemManaGained';
import Events from 'parser/core/Events';

const MAX_RESTORES_PER_USE = 6;
const ACTIVATION_COOLDOWN = 120; // seconds
const BUFF_DURATION = 20; // seconds

/**
 * Use: Your next 6 healing spells restore [x] mana. (2 Min Cooldown)
 *
 * The restored mana appears as energize events in the combat log.
 * The buff expires after 20 seconds or after casting 6 spells, whichever is sooner.
 *
 * Test Log: https://www.warcraftlogs.com/reports/ML4k1XNYFDPJ6ARb#fight=1&type=damage-done
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
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.FANGS_OF_INTERTWINED_ESSENCE_BUFF), this.onApplyBuff);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.FANGS_OF_INTERTWINED_ESSENCE_ENERGIZE), this.onEnergize);
  }

  onApplyBuff(event) {
    this.useCount += 1;
  }

  onEnergize(event) {
    this.restoreCount += 1;
    this.manaRestored += event.resourceChange;
  }

  get possibleUseCount() {
    return 1 + Math.floor(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
  }

  get restoresPerUse() {
    return this.restoreCount / this.useCount;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Activated <strong>{this.useCount}</strong> time{this.useCount === 1 ? '' : 's'} of a possible <strong>{this.possibleUseCount}</strong>. <br />
            You cast an average of <strong>{this.restoresPerUse.toFixed(1)}</strong> eligible spells during each activation, out of a possible <strong>{MAX_RESTORES_PER_USE}</strong>.
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.FANGS_OF_INTERTWINED_ESSENCE}>
          <ItemManaGained amount={this.manaRestored} />
        </BoringItemValueText>
      </ItemStatistic>
    );
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Your usage of <ItemLink id={ITEMS.FANGS_OF_INTERTWINED_ESSENCE.id} /> can be improved. Try to cast at least {MAX_RESTORES_PER_USE} spells in the {BUFF_DURATION} seconds after activating it to benefit from the full mana restoration it can provide.
        </>,
      )
        .icon(ITEMS.FANGS_OF_INTERTWINED_ESSENCE.icon)
        .actual(`${formatPercentage(actual)}% of mana restoration triggered`)
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default FangsOfIntertwinedEssence;
