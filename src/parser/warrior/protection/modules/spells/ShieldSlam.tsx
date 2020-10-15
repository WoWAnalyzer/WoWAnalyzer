import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent } from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class ShieldBlock extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };
  protected statTracker!: StatTracker;
  protected abilityTracker!: AbilityTracker;

  timeOnCd = 0; //total time its not on cd
  currentCd = 0;
  lastCast = 0;
  averageCd = 0;
  actualCasts = 0;

  totalCastsAssumed = 0;

  constructor(options: Options) {
    super(options);
    this.lastCast = this.owner.fight.start_time / 1000;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onSlamCast);
    this.addEventListener(Events.fightend, this.handleFightEnd);
  }

  onSlamCast(event: CastEvent) {
    if (this.currentCd === 0) { //we then know this is the first cast
      this.timeOnCd = event.timestamp / 1000 - this.owner.fight.start_time / 1000;
    }

    if ((event.timestamp / 1000 - this.lastCast) * 1.05 > this.currentCd) { //normal cast
      this.timeOnCd += event.timestamp / 1000 - this.lastCast;
    }

    if (this.currentCd !== 0) {
      this.averageCd += this.currentCd;
    }

    this.currentCd = 9 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.lastCast = event.timestamp / 1000;

    this.totalCastsAssumed += 1;
  }

  handleFightEnd() {
    this.actualCasts = this.abilityTracker.getAbility(SPELLS.SHIELD_SLAM.id).casts;
    if ((this.owner.fight.end_time / 1000 - this.lastCast) * 1.05 > this.currentCd) {
      this.timeOnCd += this.owner.fight.end_time / 1000 - this.lastCast;
    }
    this.averageCd = this.averageCd / this.totalCastsAssumed;
    this.totalCastsAssumed += (this.timeOnCd / this.averageCd);
    //this.totalCastsAssumed = parseInt(this.totalCastsAssumed); [dambroda: not sure what this did?]
    if (debug) {
      console.log('assumed max shield slam casts: ' + this.totalCastsAssumed);
      console.log('time on cd: ' + this.timeOnCd);
      console.log('current cd: ' + this.currentCd);
      console.log('last cast:' + this.lastCast);
      console.log('averageCd: ' + this.averageCd);
      console.log('actual casts ' + this.actualCasts);
    }
  }

  get slamRatio() {
    return this.actualCasts / this.totalCastsAssumed;
  }

  get suggestionThresholds() {
    return {
      actual: this.slamRatio,
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SHIELD_SLAM.id} /> more often - it is your main <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> generator and damage source.
        </>,
      )
        .icon(SPELLS.SHIELD_SLAM.icon)
        .actual(i18n._(t('warrior.protection.suggestions.shieldSlam.casts')`${this.actualCasts} shield slam casts`))
        .recommended(`${(recommended * this.totalCastsAssumed).toFixed(0)} recommended out of ${this.totalCastsAssumed} maximum`));
  }
}

export default ShieldBlock;
