import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import Voidform from '../spells/Voidform';

function formatSeconds(seconds: number) {
  return Math.round(seconds * 10) / 10;
}

// account for some logger delay (should be 4000):
const TIMESTAMP_ERROR_MARGIN = 100;
const VOID_TORRENT_MAX_TIME = 4000;

// Example Log: /report/hmJqLPZ7GVgY1CNa/16-Normal+Fetid+Devourer+-+Kill+(1:52)/44-베시잉/events
class VoidTorrent extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };
  protected voidform!: Voidform;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id);
  }

  _voidTorrents: any = {};
  _previousVoidTorrentCast: any;
  damage = 0;

  startedVoidTorrent(event: any) {
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  finishedVoidTorrent({ event, wastedTime }: any) {
    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    // due to sometimes being able to cast it at the same time as you leave voidform:
    if (this.voidform.inVoidform) {
      this.voidform.addVoidformEvent(SPELLS.VOID_TORRENT_TALENT.id, {
        start: this.voidform.normalizeTimestamp({ timestamp: this._previousVoidTorrentCast.timestamp }),
        end: this.voidform.normalizeTimestamp(event),
      });
    }

    this._previousVoidTorrentCast = null;
  }

  get voidTorrents() {
    return Object.keys(this._voidTorrents).map(key => this._voidTorrents[key]);
  }

  get totalWasted() {
    return this.voidTorrents.reduce((total, c) => total + c.wastedTime, 0) / 1000;
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT_TALENT.id) {
      this.startedVoidTorrent(event);
    }
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT_TALENT.id) {
      const timeSpentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
      const wastedTime = (VOID_TORRENT_MAX_TIME - TIMESTAMP_ERROR_MARGIN) > timeSpentChanneling ? (VOID_TORRENT_MAX_TIME - timeSpentChanneling) : 0;
      this.finishedVoidTorrent({ event, wastedTime });
    }
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.VOID_TORRENT_TALENT.id) {
      return;
    }
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
      style: 'seconds',
    };
  }

  suggestions(when: any) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You interrupted <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} /> early, wasting {formatSeconds(this.totalWasted)} channeling seconds! Try to position yourself & time it so you don't get interrupted due to mechanics.</>)
          .icon(SPELLS.VOID_TORRENT_TALENT.icon)
          .actual(`Lost ${formatSeconds(actual)} seconds of Void Torrent.`)
          .recommended('No time wasted is recommended.');
      });
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatSeconds(this.totalWasted)} seconds wasted`}
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
