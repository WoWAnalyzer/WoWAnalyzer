import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

function formatSeconds(seconds) {
  return Math.round(seconds * 10) / 10;
}

// account for some logger delay (should be 4000):
const TIMESTAMP_ERROR_MARGIN = 100;
const VOID_TORRENT_MAX_TIME = 4000;

class VoidTorrent extends Analyzer {
  _voidTorrents = {};
  _previousVoidTorrentCast = null;

  startedVoidTorrent(event) {
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  finishedVoidTorrent({ event, wastedTime }) {
    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    this._previousVoidTorrentCast = null;
  }

  get voidTorrents() {
    return Object.keys(this._voidTorrents).map(key => this._voidTorrents[key]);
  }

  get totalWasted() {
    return this.voidTorrents.reduce((p, c) => p += c.wastedTime, 0) / 1000;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT.id) {
      this.startedVoidTorrent(event);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT.id) {
      const timeSpentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
      const wastedTime = (VOID_TORRENT_MAX_TIME - TIMESTAMP_ERROR_MARGIN) > timeSpentChanneling ? (VOID_TORRENT_MAX_TIME - timeSpentChanneling) : 0;
      this.finishedVoidTorrent({ event, wastedTime });
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.totalWasted,
      isGreaterThan: {
        minor: 0.2,
        average: 0.5,
        major: 2,
      },
      style: 'seconds',
    };
  }

  suggestions(when) {
    when(this.totalWasted).isGreaterThan(this.suggestionThresholds.average)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You interrupted <SpellLink id={SPELLS.VOID_TORRENT.id} /> early, wasting {formatSeconds(this.totalWasted)} channeling seconds! Try to position yourself & time it so you don't get interrupted due to mechanics.</span>)
          .icon(SPELLS.VOID_TORRENT.icon)
          .actual(`Lost ${formatSeconds(actual)} seconds of Void Torrent.`)
          .recommended('No time wasted is recommended.')
          .regular(this.suggestionThresholds.average).major(this.suggestionThresholds.major);
      });
  }

  statistic() {
    return (<StatisticBox
      icon={<SpellIcon id={SPELLS.VOID_TORRENT.id} />}
      value={`${formatSeconds(this.totalWasted)} seconds`}
      label={(
        <dfn data-tip={'Lost Void Torrent channeling time.'}>
          Interrupted Void Torrents
        </dfn>
      )}
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default VoidTorrent;
