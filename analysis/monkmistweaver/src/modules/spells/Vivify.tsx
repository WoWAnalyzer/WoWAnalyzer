// Based on Clearcasting Implementation done by @Blazyb
import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

class Vivify extends Analyzer {
  casts: number = 0;

  mainTargetHitsToCount: number = 0;
  mainTargetHealing: number = 0;
  mainTargetOverhealing: number = 0;

  cleaveHits: number = 0;
  cleaveHealing: number = 0;
  cleaveOverhealing: number = 0;

  gomHealing: number = 0;
  gomOverhealing: number = 0;

  lastCastTarget: number = 0;
  gomToCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleViv);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleMastery,
    );
  }

  get averageRemPerVivify() {
    return this.cleaveHits / this.casts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageRemPerVivify,
      isLessThan: {
        minor: 1.75,
        average: 1.25,
        major: 0.75,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  vivCast(event: CastEvent) {
    this.casts += 1;
    this.gomToCount += 1;
    this.mainTargetHitsToCount += 1;
    this.lastCastTarget = event.targetID || 0;
  }

  handleViv(event: HealEvent) {
    if (this.lastCastTarget === event.targetID && this.mainTargetHitsToCount > 0) {
      this.mainTargetHealing += event.amount + (event.absorbed || 0);
      this.mainTargetOverhealing += event.overheal || 0;
      this.mainTargetHitsToCount -= 1;
    } else {
      this.cleaveHealing += event.amount + (event.absorbed || 0);
      this.cleaveOverhealing += event.overheal || 0;
      this.cleaveHits += 1;
    }
  }

  handleMastery(event: HealEvent) {
    if (this.lastCastTarget === event.targetID && this.gomToCount > 0) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
      this.gomToCount -= 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are casting <SpellLink id={SPELLS.VIVIFY.id} /> with less than 2{' '}
          <SpellLink id={SPELLS.RENEWING_MIST.id} /> out on the raid. To ensure you are gaining the
          maximum <SpellLink id={SPELLS.VIVIFY.id} /> healing, keep{' '}
          <SpellLink id={SPELLS.RENEWING_MIST.id} /> on cooldown.
        </>,
      )
        .icon(SPELLS.VIVIFY.icon)
        .actual(
          `${this.averageRemPerVivify.toFixed(2)}${t({
            id: 'monk.mistweaver.suggestions.vivify.renewingMistsPerVivify',
            message: ` Renewing Mists per Vivify`,
          })}`,
        )
        .recommended(`${recommended} Renewing Mists are recommended per Vivify`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        postion={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.VIVIFY.id} />}
        value={`${this.averageRemPerVivify.toFixed(2)}`}
        label={
          <TooltipElement
            content={
              <>
                Healing Breakdown:
                <ul>
                  <li>
                    {formatNumber(this.mainTargetHealing + this.cleaveHealing)} overall healing from
                    Vivify.
                  </li>
                  <li>
                    {formatNumber(this.cleaveHealing)} portion of your Vivify healing to REM
                    targets.
                  </li>
                </ul>
              </>
            }
          >
            Avg REMs per Cast
          </TooltipElement>
        }
      />
    );
  }
}

export default Vivify;
