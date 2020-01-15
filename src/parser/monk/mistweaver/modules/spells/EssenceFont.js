import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreChanneling from 'parser/shared/modules/Channeling';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

const debug = false;

class EssenceFont extends Analyzer {
  static dependencies = {
    channeling: CoreChanneling,
  };

  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;

  channelTime = 0;

  castEF = 0;
  targetsEF = 0;
  efHotHeal = 0;
  efHotOverheal = 0;
  targetOverlap = 0;

  uniqueTargets = new Set();
  total = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id && event.tick === true) {
      this.efHotHeal += (event.amount || 0) + (event.absorbed || 0);
      this.efHotOverheal += event.overheal || 0;
    }

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
      this.uniqueTargets.add(event.targetID);
    }

    if (spellId === SPELLS.ESSENCE_FONT.id) {
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT.id) {
      this.castEF += 1;
      this.total += this.uniqueTargets.size || 0;
      this.uniqueTargets.clear();
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF += 1;
      this.targetOverlap += 1;
    }
  }

  on_fightend() {
    if (debug) {
      const averageHits = this.total / this.castEF;
      console.log(`Average uniqueTargets hit: ${averageHits}`);
      console.log(`EF Casts: ${this.castEF}`);
      console.log(`EF Targets Hit: ${this.targetsEF}`);
      console.log(`EF Avg Targets Hit per Cast: ${this.targetsEF / this.castEF}`);
    }
  }

  get efHotHealing() {
    return (this.efHotHeal);
  }

  get efHotOverhealing() {
    return (this.efHotOverheal / (this.efHotHeal + this.efHotOverheal)).toFixed(4);
  }

  get avgTargetsHitPerEF() {
    return (this.targetsEF / this.castEF) || 0;
  }
  get efHotOverlap() {
    return ((this.targetOverlap / this.targetsEF) || 0).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerEF,
      isLessThan: {
        minor: 17,
        average: 14,
        major: 12,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> effectively. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18 targets. Either hold the cast til 6 or more targets are injured or move while casting to increase the effective range of the spell.
          </>,
        )
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${this.avgTargetsHitPerEF.toFixed(2)} average targets hit per cast`)
          .recommended(`${recommended} targets hit is recommended`);
      });
  }

  statistic() {
    const averageHits = this.total / this.castEF;
    return (
      <StatisticBox
        postion={STATISTIC_ORDER.OPTIONAL(50)}
        icon={<SpellIcon id={SPELLS.ESSENCE_FONT.id} />}
        value={`${formatNumber(averageHits)}`}
        label={(
          <TooltipElement content="This is the average unique targets hit per essences font cast.">
            Average Unique Targets Hit
          </TooltipElement>
        )}
      />
    );
  }

}

export default EssenceFont;
