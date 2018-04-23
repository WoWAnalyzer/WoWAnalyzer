import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class EssenceFontMastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healEF = 0;
  healing = 0;
  castEF = 0;
  gustHeal = false;
  secondGustHealing = 0;
  secondGustOverheal = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    const targetId = event.targetID;
    if (spellId === SPELLS.GUSTS_OF_MISTS.id) {
      if (!this.combatants.players[targetId]) {
        return;
      }
      if (this.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true && !this.gustHeal) {
        debug && console.log(`First Gust Heal: Player ID: ${event.targetID}  Timestamp: ${event.timestamp}`);
        this.healEF += 1;
        this.healing += (event.amount || 0) + (event.absorbed || 0);
        this.gustHeal = true;
      } else if (this.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true && this.gustHeal) {
        this.healEF += 1;
        this.healing += (event.amount || 0) + (event.absorbed || 0);
        this.secondGustHealing += (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
        this.secondGustOverheal += (event.overheal || 0);
        this.gustHeal = false;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT.id) {
      this.castEF += 1;
    }
  }

  on_finished() {
    if (debug) {
      console.log(`EF Mastery Hots Casted into: ${this.healEF / 2}`);
      console.log(`EF Mastery Healing Amount: ${this.healing}`);
      console.log(`EF Casts: ${this.castEF}`);
      console.log(`EF Targets Hit: ${this.targetsEF}`);
      console.log(`EF Avg Targets Hit per Cast: ${this.targetsEF / this.castEF}`);
    }
  }

  get avgMasteryCastsPerEF() {
    const efMasteryCasts = (this.healEF / 2) || 0;

    return (efMasteryCasts / this.castEF) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgMasteryCastsPerEF,
      isLessThan: {
        minor: 1.5,
        average: 1,
        major: .5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            You are currently not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOT buffs effectively. Casting into injured targets with the <SpellLink id={SPELLS.ESSENCE_FONT.id} /> allows you to take advantage of the double <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> procs.
          </React.Fragment>
        )
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${this.avgMasteryCastsPerEF.toFixed(2)} average EF HoTs`)
          .recommended(`${recommended} or more EF HoTs utilized is recommended`);
      });
  }

  statistic() {
    const efMasteryCasts = (this.healEF / 2) || 0;
    const efMasteryEffectiveHealing = ((this.healing) / 2) || 0;
    const avgEFMasteryHealing = efMasteryEffectiveHealing / efMasteryCasts || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GUSTS_OF_MISTS.id} />}
        value={`${efMasteryCasts}`}
        label={(
          <dfn data-tip={`You healed an average of ${this.avgMasteryCastsPerEF.toFixed(2)} targets per Essence Font cast.<ul>
            <li>${formatNumber(avgEFMasteryHealing)} average healing per cast</li>
            <li>${formatNumber(this.secondGustOverheal)} Second Gust of Mists overhealing (${formatPercentage(this.secondGustOverheal / this.secondGustHealing)}%)</li>
            </ul>`}>
            Mastery Buffs utilized
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default EssenceFontMastery;
