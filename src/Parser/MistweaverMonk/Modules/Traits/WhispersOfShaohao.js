import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class WhispersOfShaohao extends Module {
  stacksSG = 0;
  stacksTotalSG = 0;
  castsSG = 0;
  sgHeal = 0;
  overhealSG = 0;
  stacksWastedSG = 0;
  lastSGStack = null;
  diffLastSGStack = null;
  castsSGTimestamp = null;

  whispersHeal = 0;
  whispersOverHeal = 0;
  countWhispersHeal = 0;
  countEff = 0;

  hasEffusiveMists = 0;

  on_initialize() {
    if(!this.owner.error) {
      this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.id] === 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.WHISPERS_OF_SHAOHAO.id ) {
      this.whispersHeal += event.amount;
      if(event.overheal) {
        this.whispersOverHeal += event.overheal;
      }
      this.countWhispersHeal++;
      debug && console.log('Whispers Heal: ' + event.amount + ' / Whispers Overheal: ' + event.overheal);
    }
  }

  suggestion(when) {
    const missedWhispersHeal = ((Math.floor(this.owner.fightDuration / 10000) + this.owner.modules.sheilunsGift.countEff) - this.countWhispersHeal) || 0;
    when(missedWhispersHeal).isGreaterThan(5)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>You missed multiple <SpellLink id={SPELLS.WHISPERS_OF_SHAOHAO.id} /> healing procs. While you cannot actively place the clouds that spawn, work to position yourself near other members of the raid so that when the clouds are used, they heal someone. </span>)
        .icon(SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.icon)
        .actual(`${missedWhispersHeal} missed heals`)
        .recommended(`<${recommended} missed is recommended`)
        .regular(recommended + 2).major(recommended + 5);
      });
    }

  statistic() {
    const missedWhispersHeal = ((Math.floor(this.owner.fightDuration / 10000) + this.countEff) - this.countWhispersHeal) || 0;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WHISPERS_OF_SHAOHAO.id} />}
        value={`${(missedWhispersHeal)}`}
        label={(
          <dfn data-tip={`You had a total of ${(this.countWhispersHeal)} Whispers of Shaohao heals, but had a chance at ${(missedWhispersHeal)} additional heals.`}>
            Total Heals Missed
            </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  on_finished() {
    if(debug) {
      console.log("Total SG Stacks:" + this.stacksTotalSG);
      console.log("SG Casts: " + this.castsSG);
      console.log("Ending SG Stacks: " + this.stacksSG);
      console.log("SG Stacks Wasted: " + this.stacksWastedSG);
      console.log("SG Overheal Total: " + this.overhealSG + "  Avg SG Overheal: " + (this.overhealSG / this.castsSG));
    }
  }
}

export default WhispersOfShaohao;
