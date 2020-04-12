import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';

const MAELSTROM_THRESHOLD = 95;
// 120 is threshold, but energize event values
// are after the 25 Maelstrom increase is applied

class Rockbiter extends Analyzer {
  protected rockbiterOveruse = 0;
  protected rockbiterTotalCasts = 0;
  protected maelstromWasted = 0;

  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.energize.by(SELECTED_PLAYER)
        .spell(SPELLS.ROCKBITER),
      this.onEnergize,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.ROCKBITER),
      this.onCast,
    );
  }

  onCast() {
    this.rockbiterTotalCasts += 1;
  }

  onEnergize(event: EnergizeEvent) {
    if (event.classResources &&
      event.classResources[0].amount >=
      MAELSTROM_THRESHOLD) {
      this.rockbiterOveruse += 1;
    }

    if (event.waste > 0) {
      this.maelstromWasted += event.waste;
    }
  }

  get overusePercentage() {
    return this.rockbiterOveruse / this.rockbiterTotalCasts;
  }

  get rockbiterSuggestionsTreshold() {
    return {
      actual: this.maelstromWasted,
      isGreaterThan: {
        minor: 100,
        average: 150,
        major: 200,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    when(this.rockbiterSuggestionsTreshold)
      .addSuggestion(
        (suggest: any, actual: any, recommended: any) => {
          return suggest(
            <Trans>
              Try to minimize Maelstrom wastage as much as possible. Some of wasted MS is unavoidable due to maintaining Landslide buff ')
            </Trans>,
          )
            .icon(SPELLS.ROCKBITER.icon)
            .actual(
              <Trans>
                {actual} wasted Maelstrom in ${this.rockbiterOveruse} of ${this.rockbiterTotalCasts} (${formatPercentage(
                this.overusePercentage,
                0,
              )}%) casts
              </Trans>,
            )
            .recommended(
              <Trans>No more than {recommended} is recommended</Trans>,
            );
        },
      );
  }
}

export default Rockbiter;
