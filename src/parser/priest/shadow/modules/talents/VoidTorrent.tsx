import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import {MS_BUFFER, VOID_TORRENT_MAX_TIME } from '../../constants';

function formatSeconds(seconds: number) {
  return Math.round(seconds * 10) / 10;
}

// Example Log: /report/hmJqLPZ7GVgY1CNa/16-Normal+Fetid+Devourer+-+Kill+(1:52)/44-베시잉/events
class VoidTorrent extends Analyzer {

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_TORRENT_TALENT), this.onVoidTorrentCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOID_TORRENT_TALENT), this.onVoidTorrentRemoved);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_TORRENT_TALENT), this.onVoidTorrentDamage);
  }

  _voidTorrents: any = {};
  _previousVoidTorrentCast: any;
  damage = 0;

  get voidTorrents() {
    return Object.keys(this._voidTorrents).map(key => this._voidTorrents[key]);
  }

  get totalWasted() {
    return this.voidTorrents.reduce((total, c) => total + c.wastedTime, 0) / 1000;
  }

  onVoidTorrentCast(event: CastEvent) {
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  onVoidTorrentRemoved(event: RemoveBuffEvent) {
    const timeSpentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
    const wastedTime = (VOID_TORRENT_MAX_TIME - MS_BUFFER) > timeSpentChanneling ? (VOID_TORRENT_MAX_TIME - timeSpentChanneling) : 0;
    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    this._previousVoidTorrentCast = null;
  }

  onVoidTorrentDamage(event: DamageEvent) {
    this.damage += event.amount || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalWasted,
      isGreaterThan: {
        minor: 0.2,
        average: 0.5,
        major: 2,
      },
      style: ThresholdStyle.SECONDS,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You interrupted <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} /> early, wasting {formatSeconds(this.totalWasted)} channeling seconds! Try to position yourself & time it so you don't get interrupted due to mechanics.</>)
          .icon(SPELLS.VOID_TORRENT_TALENT.icon)
          .actual(i18n._(t('priest.shadow.suggestions.voidTorrent.secondsLost')`Lost ${formatSeconds(actual)} seconds of Void Torrent.`))
          .recommended('No time wasted is recommended.'));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatSeconds(this.totalWasted)} seconds wasted by cancelling the channel early.`}
      >
        <BoringSpellValueText spell={SPELLS.VOID_TORRENT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidTorrent;
