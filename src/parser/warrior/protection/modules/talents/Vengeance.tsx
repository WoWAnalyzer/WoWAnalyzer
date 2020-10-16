import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import RageTracker from '../core/RageTracker';

class Vengeance extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };
  protected rageTracker!: RageTracker;

  buffedIgnoreCasts = 0;
  buffedRevengeCasts = 0;
  ignoreBuffsOverwritten = 0;
  revengeBuffsOverwritten = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VENGEANCE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IGNORE_PAIN), this.onIgnorePainCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REVENGE), this.onRevengeCast);
  }

  onRevengeCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_IGNORE_PAIN.id)) {
      this.ignoreBuffsOverwritten += 1;
    } else if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_REVENGE.id)) {
      this.buffedRevengeCasts += 1;
    }
  }

  onIgnorePainCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_REVENGE.id)) {
      this.revengeBuffsOverwritten += 1;
    } else if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_IGNORE_PAIN.id)) {
      this.buffedIgnoreCasts += 1;
    }
  }

  get buffUsage() {
    return (this.ignoreBuffsOverwritten + this.revengeBuffsOverwritten) / (this.buffedIgnoreCasts + this.buffedRevengeCasts + this.ignoreBuffsOverwritten + this.revengeBuffsOverwritten);
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.buffUsage,
      isGreaterThan: {
        minor: 0,
        average: .1,
        major: .2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>Avoid casting <SpellLink id={SPELLS.IGNORE_PAIN.id} /> and <SpellLink id={SPELLS.REVENGE.id} /> back to back without using it's counterpart. <SpellLink id={SPELLS.VENGEANCE_TALENT.id} /> requires you to weave between those two spells to get the most rage and damage out of it.</>)
            .icon(SPELLS.VENGEANCE_TALENT.icon)
            .actual(i18n._(t('warrior.protection.suggestions.vengeance.overwritten')`${formatPercentage(actual)}% overwritten`))
            .recommended(`${formatPercentage(recommended)}% recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VENGEANCE_TALENT.id} />}
        value={`${formatPercentage(this.buffUsage)}%`}
        label="Buffs unused"
        tooltip={(
          <>
            {this.buffedIgnoreCasts} buffed {SPELLS.IGNORE_PAIN.name} casts<br />
            {this.buffedRevengeCasts} buffed {SPELLS.REVENGE.name} casts<br />
            You refreshed your "{SPELLS.VENGEANCE_IGNORE_PAIN.name}" buff {this.ignoreBuffsOverwritten} times<br />
            You refreshed your "{SPELLS.VENGEANCE_REVENGE.name}" buff {this.revengeBuffsOverwritten} times<br /><br />

            You saved <strong>{this.rageTracker.rageSavedByVengeance}</strong> Rage by casting {SPELLS.IGNORE_PAIN.name} and {SPELLS.REVENGE.name} with Vengeance up.
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Vengeance;
