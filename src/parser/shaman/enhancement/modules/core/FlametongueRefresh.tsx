import React from 'react';
import { Trans } from '@lingui/macro';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { FLAMETONGUE_BUFF_REFRESH_THRESHOLD } from '../../constants';

// Don't refresh with more than 4.5 seconds left on Flametongue buff
const PANDEMIC_THRESHOLD = 11500;

class FlametongueRefresh extends Analyzer {
  protected flametongueTimestamp: number = 0;
  protected flametongueCasts: number = 0;
  protected earlyRefresh: number = 0;

  constructor(options: any) {
    super(options);

    // If Searing Assult talent is chosen, the player will want to cast
    // Flametongue alot more often to maximie the talent. Making any
    // suggestions regarding Flametongue Refreshes unnecessary.
    if (this.selectedCombatant.hasTalent(SPELLS.SEARING_ASSAULT_TALENT.id)) {
      this.active = false;
      return;
    }

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
          return suggest(<Trans>Avoid refreshing <SpellLink id={SPELLS.FLAMETONGUE.id} /> too early. You can optimally refresh it with less than {FLAMETONGUE_BUFF_REFRESH_THRESHOLD} seconds remaining on the buff.</Trans>)
            .icon(SPELLS.FLAMETONGUE_BUFF.icon)
            .actual(<Trans>{actual} of {this.flametongueCasts} ({formatPercentage(this.refreshPercentageCast,0)}%) early refreshes</Trans>)
            .recommended(<Trans>{recommended} recommended</Trans>);
        },
      );
  }
}

export default FlametongueRefresh;
