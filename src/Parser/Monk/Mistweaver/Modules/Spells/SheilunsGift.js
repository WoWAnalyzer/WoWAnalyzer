import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

function getRawHealing(ability) {
  return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
}
function getOverhealingPercentage(ability) {
  return ability.healingOverheal / getRawHealing(ability);
}

class SheilunsGift extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  stacksSG = 0;
  stacksTotalSG = 0;
  castsSG = 0;
  sgHeal = 0;
  overhealSG = 0;
  stacksWastedSG = 0;
  lastSGStack = null;
  diffLastSGStack = null;
  castsSGTimestamp = null;

  countEff = 0;

  hasEffusiveMists = 0;

  on_initialize() {
    this.hasEffusiveMists = this.combatants.selected.traitsBySpellId[SPELLS.EFFUSIVE_MISTS.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      this.stacksSG += 1;
      debug && console.log(`SG stacks at ${this.stacksSG}`);
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      this.stacksSG += 1;
      this.lastSGStack = event.timestamp;
      debug && console.log(`SG stacks at ${this.stacksSG}  Timestamp: ${event.timestamp}`);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHEILUNS_GIFT_BUFF.id) {
      debug && console.log(`SG stacks at ${this.stacksSG}`);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EFFUSE.id) {
      this.countEff += 1;
    }

    if (spellId === SPELLS.SHEILUNS_GIFT.id) {
      this.castsSG += 1;
      this.stacksTotalSG += this.stacksSG;
      this.stacksSG = 0;
      this.diffLastSGStack = event.timestamp - this.lastSGStack;
      this.castsSGTimestamp = event.timestamp;
      debug && console.log(`SG Cast at ${this.stacksSG} / Timestamp: ${event.timestamp}`);
      debug && console.log(`Time Since Last SG Stack: ${this.diffLastSGStack}`);
      if (this.diffLastSGStack > 10000) {
        this.stacksWastedSG += Math.floor(this.diffLastSGStack / 10000);
        debug && console.log('SG Capped');
      }
    }
    if (spellId === SPELLS.EFFUSE.ID && this.hasEffusiveMists && this.stacksSG === 12) {
      this.stacksWastedSG += 1;
      debug && console.log('Effuse Cast at Capped SG');
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHEILUNS_GIFT.id) {
      this.sgHeal += event.amount + (event.absorbed || 0);
      if (event.overheal) {
        this.overhealSG += event.overheal;
      }
      debug && console.log(`SG Overheal: ${event.overheal}`);
    }
  }

  get avgSgStacks() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;

    return this.stacksTotalSG / SGcasts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgSgStacks,
      isGreaterThan: {
        minor: 7,
        average: 9,
        major: 11,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const sheilunsGiftHealing = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const sheilunsGiftOverhealingPercentage = getOverhealingPercentage(sheilunsGiftHealing) || 0;

    when(sheilunsGiftOverhealingPercentage).isGreaterThan(0.5)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestionText;
        if (this.avgSgStacks >= 6) {
          suggestionText = <span>You had high overheal when using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> and casted with greater than 6 stacks. Consider using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> at lower stacks to increase effectiveness.</span>;
        } else {
          suggestionText = <span>You had high overheal when using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> and casted with less than 6 stacks. Consider using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> on injured targets to increase effectiveness.</span>;
        }
        return suggest(suggestionText)
          .icon(SPELLS.SHEILUNS_GIFT.icon)
          .actual(`${formatPercentage(sheilunsGiftOverhealingPercentage)}% Sheilun's Gift Overhealing - ${this.avgSgStacks.toFixed(0)} average Sheilun's Gift stacks`)
          .recommended(`<${formatPercentage(recommended)}% Sheilun's Gift Overheal is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
  }

  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;
    const wastedSGStacks = this.stacksWastedSG + Math.floor((this.owner.fightEndTime - this.lastSGStack) / 10000);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHEILUNS_GIFT.id} />}
        value={`${(this.avgSgStacks).toFixed(0)}`}
        label={(
          <dfn data-tip={`${SGcasts > 0 ? `You healed for an average of ${formatNumber(this.sgHeal / this.castsSG)} with each Sheilun's cast.` : ''}
          ${wastedSGStacks > 0 ? `<br>You wasted ${(wastedSGStacks)} stack(s) during this fight.` : ''}
          `}
          >
          Avg stacks used
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(20);

  on_finished() {
    if (debug) {
      console.log(`Total SG Stacks:${this.stacksTotalSG}`);
      console.log(`SG Casts: ${this.castsSG}`);
      console.log(`Ending SG Stacks: ${this.stacksSG}`);
      console.log(`SG Stacks Wasted: ${this.stacksWastedSG}`);
      console.log(`SG Overheal Total: ${this.overhealSG}  Avg SG Overheal: ${this.overhealSG / this.castsSG}`);
    }
  }
}

export default SheilunsGift;
