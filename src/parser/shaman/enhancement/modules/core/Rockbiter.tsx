import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EnergizeEvent } from 'parser/core/Events';

// 120 is threshold, but energize event values are after the 25 Maelstrom increase is applied
const MAELSTROM_THRESHOLD = 95;

class Rockbiter extends Analyzer {
  protected rockbiterOveruse: number = 0;
  protected rockbiterTotalCasts: number = 0;
  protected maelstromWasted: number = 0;

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

  onCast(event: CastEvent) {
    this.rockbiterTotalCasts += 1;
  }

  onEnergize(event: EnergizeEvent) {
    const maelstromResource = event.classResources && event.classResources.find(classResource => classResource.type === RESOURCE_TYPES.MAELSTROM.id);

    if (!maelstromResource) {
      return;
    }

    if (maelstromResource.amount >= MAELSTROM_THRESHOLD) {
      this.rockbiterOveruse += 1;
    }

    if (event.waste > 0) {
      this.maelstromWasted += event.waste;
    }
  }

  get overusePercentage() {
    return this.rockbiterOveruse / this.rockbiterTotalCasts;
  }

  get rockbiterSuggestionsThreshold() {
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
    when(this.rockbiterSuggestionsThreshold)
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
