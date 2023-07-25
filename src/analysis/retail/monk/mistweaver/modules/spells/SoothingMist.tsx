import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import StatTracker from 'parser/shared/modules/StatTracker';
import { isFromSoothingMist } from '../../normalizers/CastLinkNormalizer';

class SoothingMist extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  soomTicks: number = 0;
  gustsHealing: number = 0;
  startStamp: number = 0;
  endStamp: number = 0;
  soomInProgress: boolean = false;
  castsInSoom: number = 0;
  badSooms: number = 0;
  totalSoomCasts = 0;
  assumedGCD: number = 0;
  startGCD: number = 0;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.assumedGCD = 1500 * 0.95;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.castSoothingMist,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.castDuringSoothingMist,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.handleSoothingMist,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.masterySoothingMist,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.removeBuffSoothingMist,
    );
    this.addEventListener(Events.fightend, this.end);
  }

  get soomTicksPerDuration() {
    const soomTicks = ((this.soomTicks * 2) / this.owner.fightDuration) * 1000 || 0;
    return soomTicks >= 1.5;
  }

  get suggestionThresholds() {
    return {
      actual: this.soomTicksPerDuration,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get soomThresholds() {
    return (this.totalSoomCasts - this.badSooms) / this.totalSoomCasts;
  }

  get suggestionThresholdsCasting() {
    return {
      actual: this.soomThresholds,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  handleSoothingMist(event: HealEvent) {
    this.soomTicks += 1;
  }

  masterySoothingMist(event: HealEvent) {
    if (isFromSoothingMist(event)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  castDuringSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
      this.castsInSoom += 1;
    }
  }

  castSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
      this.endStamp = event.timestamp;
      this.checkChannelTiming();
      this.castsInSoom = 0;
    }

    this.startStamp = event.timestamp;
    this.soomInProgress = true;
    const gcd = 1000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.startGCD = Math.max(750, gcd) * 0.95;
  }

  removeBuffSoothingMist(event: RemoveBuffEvent) {
    if (!this.soomInProgress) {
      return;
    }

    this.endStamp = event.timestamp;
    this.soomInProgress = false;
    this.checkChannelTiming();
    this.castsInSoom = 0;
  }

  checkChannelTiming() {
    this.totalSoomCasts += 1;
    let duration = this.endStamp - this.startStamp;

    if (duration < this.startGCD) {
      return;
    }

    duration -= this.startGCD;

    this.castsInSoom -= duration / this.assumedGCD;
    if (
      this.castsInSoom < 0 &&
      !(
        this.selectedCombatant.hasTalent(TALENTS_MONK.UNISON_TALENT) &&
        this.selectedCombatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT)
      )
    ) {
      this.badSooms += 1;
    }
  }

  end(event: FightEndEvent) {
    if (this.soomInProgress) {
      this.endStamp = this.owner.fightDuration;
      this.checkChannelTiming();
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You are allowing <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} /> to channel for an
          extended period of time. <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} /> does
          little healing, so your time is better spent DPS'ing through the use of{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} /> and <SpellLink spell={SPELLS.BLACKOUT_KICK} />.
        </>,
      )
        .icon(TALENTS_MONK.SOOTHING_MIST_TALENT.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
    );

    when(this.suggestionThresholdsCasting).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You were channeling <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} /> without
          casting spells during it. Replace this channel time with damage abilities like{' '}
          <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />.
        </>,
      )
        .icon(TALENTS_MONK.SOOTHING_MIST_TALENT.icon)
        .actual(
          `${formatPercentage(this.badSooms / this.totalSoomCasts)}${defineMessage({
            id: 'monk.mistweaver.suggestions.soothingMist.channelingWithoutCastingSpells',
            message: `% of Soothing Mist casts with max spells casted`,
          })}`,
        )
        .recommended(`${recommended} is recommended`),
    );
  }
}

export default SoothingMist;
