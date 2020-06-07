import React from 'react';
import { Trans } from '@lingui/macro';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { FLAMETONGUE_BUFF_DURATION_MS, FLAMETONGUE_BUFF_REFRESH_THRESHOLD, FLAMETONGUE_BUFF_REFRESH_THRESHOLD_MS } from '../../constants';

class FlametongueRefresh extends Analyzer {
  protected casts: number = 0;
  protected earlyRefreshes: number = 0;
  protected flametongueEndTimestamp: number = 0;

  constructor(options: any) {
    super(options);

    // If Searing Assult talent is chosen, the player will want to cast
    // Flametongue alot more often to maximie the talent. Making any
    // suggestions regarding Flametongue Refreshes unnecessary.
    if (this.selectedCombatant.hasTalent(SPELLS.SEARING_ASSAULT_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLAMETONGUE), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMETONGUE_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMETONGUE_BUFF), this.onRefreshBuff);
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.flametongueEndTimestamp = event.timestamp + FLAMETONGUE_BUFF_DURATION_MS;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const timeRemaining = this.flametongueEndTimestamp - event.timestamp;

    if (this.flametongueEndTimestamp - event.timestamp > FLAMETONGUE_BUFF_REFRESH_THRESHOLD_MS) {
      this.earlyRefreshes += 1;
    }

    const extendedDuration = timeRemaining > FLAMETONGUE_BUFF_REFRESH_THRESHOLD_MS ? FLAMETONGUE_BUFF_REFRESH_THRESHOLD_MS : timeRemaining;

    this.flametongueEndTimestamp = event.timestamp + FLAMETONGUE_BUFF_DURATION_MS + extendedDuration;
  }

  get refreshPercentageCast() {
    return this.earlyRefreshes / this.casts;
  }

  get flametongueEarlyRefreshThreshold() {
    return {
      actual: this.earlyRefreshes,
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
          return suggest(<Trans>Avoid refreshing <SpellLink id={SPELLS.FLAMETONGUE.id} /> too early. You can optimally refresh it with less than {FLAMETONGUE_BUFF_REFRESH_THRESHOLD} seconds remaining on the buff.</Trans>)
            .icon(SPELLS.FLAMETONGUE_BUFF.icon)
            .actual(<Trans>{actual} of {this.casts} ({formatPercentage(this.refreshPercentageCast,0)}%) early refreshes</Trans>)
            .recommended(<Trans>{recommended} recommended</Trans>);
        },
      );
  }
}

export default FlametongueRefresh;
