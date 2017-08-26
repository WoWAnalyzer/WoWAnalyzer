import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

function formatSeconds(seconds){
  return Math.round(seconds * 10)/10;
}

// account for some logger delay (should be 4000):
const VOID_TORRENT_MAX_TIME = 3900;

class VoidTorrent extends Module {
  _voidTorrents = {};
  _previousVoidTorrentCast = null;

  startedVoidTorrent(event){
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  finishedVoidTorrent({event, wastedTime}){
    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    this._previousVoidTorrentCast = null;
  }

  get voidTorrentsAsArray(){
    return Object.keys(this._voidTorrents).map(key => this._voidTorrents[key]);
  }

  get totalWasted(){
    return this.voidTorrentsAsArray.reduce((p, c) => p += c.wastedTime, 0) / 1000;
  }

  on_initialized() {
    this.active = true;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT.id) {
      this.startedVoidTorrent(event);
    }
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT.id) {
      const timespentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
      const wastedTime = VOID_TORRENT_MAX_TIME > timespentChanneling ? (4000 - timespentChanneling) : 0;
      this.finishedVoidTorrent({event, wastedTime});
    }
  }

  suggestions(when) {
    when(this.totalWasted).isGreaterThan(0.5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You interrupted <SpellLink id={SPELLS.VOID_TORRENT.id} /> early, wasting {formatSeconds(this.totalWasted)} channeling seconds! Try to position yourself & time it so you don't get interrupted due to mechanics.</span>)
          .icon(SPELLS.VOID_TORRENT.icon)
          .actual(`Lost ${formatSeconds(this.totalWasted)} seconds of Void Torrent.`)
          .recommended(`No time wasted is recommended.`)
          .regular(recommended - 0.5).major(recommended - 2);
      });
  }

  statistic() {
    if(this.totalWasted < 0.5) return null;
    return (<StatisticBox
      icon={<SpellIcon id={SPELLS.VOID_TORRENT.id} />}
      value={`${formatSeconds(this.totalWasted)} seconds`}
      label={(
        <dfn data-tip={`Void torrent was interrupted early. This should be avoided!`}>
          Interrupted void torrents
        </dfn>
      )}
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(7);

}

export default VoidTorrent;