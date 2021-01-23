import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { UpdateSpellUsableEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Trans } from '@lingui/macro';

class PhoenixFlames extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  chargesCapped = false;
  cappedTimestamp = 0;
  timeSpentCapped = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES), this.onCooldownUpdate);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES), this.onPhoenixCast);
  }

  onCooldownUpdate(event: UpdateSpellUsableEvent) {
    if (event.trigger !== "endcooldown") {
      return;
    }
    this.chargesCapped = true;
    this.cappedTimestamp = event.timestamp;
  }

  onPhoenixCast(event: CastEvent) {
    if (!this.chargesCapped) {
      return;
    }
    this.timeSpentCapped += event.timestamp - this.cappedTimestamp;
    this.chargesCapped = false;
    this.cappedTimestamp = 0;
  }

  get percentCapped() {
    return this.timeSpentCapped / this.owner.fightDuration;
  }

  get cappedSeconds() {
    return this.timeSpentCapped / 1000;
  }

  get phoenixCappedChargesThresholds() {
    return {
      actual: this.percentCapped,
      isGreaterThan: {
        minor: .05,
        average: .1,
        major: .2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }


  suggestions(when: When) {
    when(this.phoenixCappedChargesThresholds)
    .addSuggestion((suggest, actual, recommended) => suggest(<>You spent {formatNumber(this.cappedSeconds)}s ({formatPercentage(this.percentCapped)}% of the fight) capped on <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> charges. While it is important to pool charges for your next <SpellLink id={SPELLS.COMBUSTION.id} />, it is also important that you avoid capping on charges whenever possible. To avoid this, you should use a charge of <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> if you are capped or are about to cap on charges.</>)
        .icon(SPELLS.PHOENIX_FLAMES.icon)
        .actual(<Trans id="mage.fire.suggestions.phoenixFlames.phoenixFlamesCappedCharges">{formatPercentage(actual)}% of fight capped on charges</Trans>)
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}
export default PhoenixFlames;
