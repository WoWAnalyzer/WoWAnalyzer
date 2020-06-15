import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent } from 'parser/core/Events';

/** @type {number} (ms) When Holy Shock has less than this as cooldown remaining you should wait and still not cast that filler FoL. */
const HOLY_SHOCK_COOLDOWN_WAIT_TIME = 200;

class FillerLightOfTheMartyrs extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR),
      this.handleCast,
    );
  }

  protected casts = 0;
  protected inefficientCasts: CastEvent[] = [];
  handleCast(event: CastEvent) {
    this.casts += 1;

    const hasHolyShockAvailable = this.spellUsable.isAvailable(SPELLS.HOLY_SHOCK_CAST.id);
    if (!hasHolyShockAvailable) {
      // We can't cast it, but check how long until it comes off cooldown. We should wait instead of casting a filler if it becomes available really soon.
      const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id);
      if (cooldownRemaining > HOLY_SHOCK_COOLDOWN_WAIT_TIME) {
        return;
      }
    }
    this.inefficientCasts.push(event);
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason =
      'Holy Shock was available and should have been cast instead as it is a much more efficient spell.';
  }

  get cpm() {
    return (this.casts / (this.owner.fightDuration / 1000)) * 60;
  }
  get inefficientCpm() {
    return (this.inefficientCasts.length / (this.owner.fightDuration / 1000)) * 60;
  }

  get cpmSuggestionThresholds() {
    return {
      actual: this.cpm,
      isGreaterThan: {
        minor: 1.5,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }
  get inefficientCpmSuggestionThresholds() {
    return {
      actual: this.inefficientCpm,
      isGreaterThan: {
        minor: 0,
        average: 0.25,
        major: 0.5,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    when(this.cpmSuggestionThresholds).addSuggestion(
      (suggest: any, actual: any, recommended: any) => {
        return suggest(
          <Trans>
            You cast many <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />
            s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the
            Martyr when it will save someone's life or when moving and all other instant cast spells
            are on cooldown.
          </Trans>,
        )
          .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
          .actual(
            <Trans>
              {this.cpm.toFixed(2)} casts per minute - {this.casts} casts total
            </Trans>,
          )
          .recommended(<Trans>&lt;{recommended} casts per minute is recommended</Trans>);
      },
    );

    when(this.inefficientCpmSuggestionThresholds).addSuggestion((suggest: any, actual: any) => {
      return suggest(
        <Trans>
          You cast {this.inefficientCasts.length} <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s
          while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was{' '}
          <TooltipElement
            content={
              <Trans>
                It was either already available or going to be available within{' '}
                {HOLY_SHOCK_COOLDOWN_WAIT_TIME}ms.
              </Trans>
            }
          >
            available
          </TooltipElement>{' '}
          (at{' '}
          {this.inefficientCasts
            .map(event => this.owner.formatTimestamp(event.timestamp))
            .join(', ')}
          ). Try to <b>never</b> cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when
          something else is available
          <TooltipElement
            content={
              <Trans>
                There are very rare exceptions to this. For example it may be worth saving Holy
                Shock when you know you're going to be moving soon and you may have to heal
                yourself.
              </Trans>
            }
          >
            *
          </TooltipElement>
          .
        </Trans>,
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(<Trans>{this.inefficientCasts.length} casts while Holy Shock was available</Trans>)
        .recommended(<Trans>No inefficient casts is recommended</Trans>);
    });
  }
}

export default FillerLightOfTheMartyrs;
