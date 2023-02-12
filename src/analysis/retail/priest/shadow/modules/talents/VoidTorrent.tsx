import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

import {
  MS_BUFFER,
  VOID_TORRENT_MAX_TIME,
  VOID_TORRENT_INSANITY_PER_SECOND,
} from '../../constants';

function formatSeconds(seconds: number) {
  return Math.round(seconds * 10) / 10;
}

// Example Log: /report/jcHgC7bfNAMqtRFv/12-Mythic+Hungering+Destroyer+-+Kill+(6:41)/Adoraci/standard/statistics
class VoidTorrent extends Analyzer {
  _previousVoidTorrentCast: any;
  damage = 0;
  totalChannelingTime = 0;
  totalWastedTime = 0;
  insanityGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_TORRENT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.VOID_TORRENT_BUFF),
      this.onEnergize,
    );
  }

  _voidTorrents: any = {};

  get voidTorrents() {
    return Object.keys(this._voidTorrents).map((key) => this._voidTorrents[key]);
  }

  get timeWasted() {
    return this.voidTorrents.reduce((total, c) => total + c.wastedTime, 0) / 1000;
  }

  get timeWastedPercentage() {
    return this.timeWasted / this.totalChannelingTime;
  }

  get insanityWasted() {
    return this.timeWasted * VOID_TORRENT_INSANITY_PER_SECOND;
  }

  get insanityOvercapped() {
    // Can't use the Energize event's waste because it shows 0 for some reason even if you overcap, so we calculate based on the time channeling vs. how much sanity you should've gotten from it
    return (
      (this.totalChannelingTime / 1000) * VOID_TORRENT_INSANITY_PER_SECOND - this.insanityGained
    );
  }

  get insanityOvercappedPercentage() {
    return (
      this.insanityOvercapped /
      (this.insanityOvercapped + this.insanityGained + this.insanityWasted)
    );
  }

  get interruptThreshold() {
    return {
      actual: this.timeWastedPercentage,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get overcapThreshold() {
    return {
      actual: this.insanityOvercappedPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent | DamageEvent) {
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const timeSpentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
    const wastedTime =
      VOID_TORRENT_MAX_TIME - MS_BUFFER > timeSpentChanneling
        ? VOID_TORRENT_MAX_TIME - timeSpentChanneling
        : 0;
    this.totalChannelingTime += VOID_TORRENT_MAX_TIME - wastedTime;

    this.totalWastedTime += wastedTime;

    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    this._previousVoidTorrentCast = null;
  }

  onDamage(event: DamageEvent) {
    if (this.voidTorrents.length === 0) {
      this.onCast(event);
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  suggestions(when: When) {
    when(this.interruptThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You interrupted <SpellLink id={TALENTS.VOID_TORRENT_TALENT.id} /> early, wasting{' '}
          {formatSeconds(this.timeWasted)} channeling seconds! Try to position yourself & time it so
          you don't get interrupted due to mechanics.
        </>,
      )
        .icon(TALENTS.VOID_TORRENT_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.voidTorrent.secondsLost',
            message: `Lost ${formatSeconds(this.timeWasted)} seconds of Void Torrent.`,
          }),
        )
        .recommended('No time wasted is recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatSeconds(this.timeWasted)} seconds wasted by cancelling the channel early.
            <br />
            {formatNumber(this.insanityWasted)} insanity wasted by cancelling the channel early.{' '}
            <br />
            {formatNumber(this.insanityOvercapped)} insanity wasted by overcapping sanity.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.VOID_TORRENT_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <Insanity /> {this.insanityGained} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const channelTime = {
      count: formatSeconds(this.totalChannelingTime / 1000),
      label: 'Cast Time',
    };

    const wastedTime = {
      count: formatSeconds(this.totalWastedTime / 1000),
      label: 'Lost Time',
    };

    const insanityGained = {
      count: Math.round(this.insanityGained),
      label: 'Gained Insanity',
    };

    const insanityWasted = {
      count: Math.round(this.insanityOvercapped),
      label: 'Overcapped Insanity',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.VOID_TORRENT_TALENT.id} />
        </b>{' '}
        is a powerful cooldown
        <br />
        You should cast this spell as often as you can, without wasting insanity. When you use this
        spell, it should be fully channeled.
      </p>
    );

    const data = (
      <div>
        <strong>Time lost</strong>
        <GradiatedPerformanceBar good={channelTime} bad={wastedTime} />
        <strong>Insanity Wasted</strong>
        <GradiatedPerformanceBar good={insanityGained} bad={insanityWasted} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default VoidTorrent;
