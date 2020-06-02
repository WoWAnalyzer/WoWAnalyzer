import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';

// Don't refresh with more than 4.5 seconds left on Flametongue buff
const PANDEMIC_THRESHOLD = 11500;

class FlametongueRefresh extends Analyzer {
  protected flametongueTimestamp: number = 0;
  protected flametongueCasts: number = 0;
  protected earlyRefresh: number = 0;

  constructor(options: any) {
    super(options);

    this.active = !this.selectedCombatant.hasTalent(SPELLS.SEARING_ASSAULT_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.FLAMETONGUE),
      this.onCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER)
        .spell(SPELLS.FLAMETONGUE_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER)
        .spell(SPELLS.FLAMETONGUE_BUFF),
      this.onRefreshBuff,
    );
  }

  onCast(event: CastEvent) {
    this.flametongueCasts += 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.flametongueTimestamp = event.timestamp;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    if (this.flametongueTimestamp !== 0) {
      if (event.timestamp - this.flametongueTimestamp < PANDEMIC_THRESHOLD) {
        this.earlyRefresh += 1;
      }
    }
    this.flametongueTimestamp = event.timestamp;
  }

  get refreshPercentageCast() {
    return this.earlyRefresh / this.flametongueCasts;
  }

  get flametongueEarlyRefreshThreshold() {
    return {
      actual: this.earlyRefresh,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    when(this.flametongueEarlyRefreshThreshold)
      .addSuggestion(
        (suggest: any, actual: any, recommended: any) => {
          return suggest(
            <>Avoid refreshing Flametongue with more then 4.5 sec left on the buff.
              Some early refreshes are unavoidable.</>)
            .icon(SPELLS.FLAMETONGUE_BUFF.icon)
            .actual(
              <Trans>
                {actual} of {this.flametongueCasts} ({formatPercentage(
                this.refreshPercentageCast,
                0,
              )}%) early refreshes
              </Trans>,
            )
            .recommended(
              <Trans>{recommended} recommended</Trans>,
            );
        },
      );
  }
}

export default FlametongueRefresh;
