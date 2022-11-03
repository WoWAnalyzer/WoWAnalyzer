import { Trans } from '@lingui/macro';
import { formatPercentage, formatNumber, formatThousands, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import CooldownIcon from 'interface/icons/Cooldown';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AlwaysBeCasting from '../core/AlwaysBeCasting';

class WaterElemental extends Analyzer {
  static dependencies = {
    abc: AlwaysBeCasting,
  };
  protected abc!: AlwaysBeCasting;

  beginCastSpell?: BeginCastEvent;
  _waterboltsCancelled = 0;
  _waterboltsCastStarts = 0;
  _waterboltHits = 0;
  _waterboltDamage = 0;
  wasCastStarted = false;
  petActiveTime = 0;
  _timestampLastFinish = 0;
  _timestampLastCast = 0;
  _timestampFirstCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.LONELY_WINTER_TALENT.id);

    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT),
      this.onWaterboltBeginCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT),
      this.onWaterboltCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT),
      this.onWaterboltDamage,
    );
  }

  onWaterboltBeginCast(event: BeginCastEvent) {
    if (this.wasCastStarted) {
      this._waterboltsCancelled += 1;
    }
    if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
      this._timestampFirstCast = event.timestamp;
    }
    this.beginCastSpell = event;
    this.wasCastStarted = true;
    this._timestampLastCast = event.timestamp;
  }

  onWaterboltCast(event: CastEvent) {
    if (
      this.beginCastSpell &&
      this.beginCastSpell.ability.guid !== event.ability.guid &&
      this.wasCastStarted
    ) {
      this._waterboltsCancelled += 1;
    } else {
      this._waterboltsCastStarts += 1;
      this._timestampLastFinish = event.timestamp;
      if (this._timestampLastCast === 0) {
        //in case casting was started before going infight
        this._timestampLastCast = this.owner.fight.start_time;
      }
      if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
        this._timestampFirstCast = event.timestamp;
      }
      this.petActiveTime += this._timestampLastFinish - this._timestampLastCast;
    }
    this.wasCastStarted = false;
  }

  onWaterboltDamage(event: DamageEvent) {
    if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
      this._timestampFirstCast = event.timestamp;
    }
    this._waterboltHits += 1;
    this._waterboltDamage += event.amount + (event.absorbed || 0);
  }

  get petDowntimePercentage() {
    return 1 - this.petActiveTimePercentage;
  }

  get petActiveTimePercentage() {
    return this.petActiveTime / this.owner.fightDuration;
  }

  get prepullSummonCheck() {
    return this._timestampFirstCast - this.owner.fight.start_time;
  }

  get petTotalCasts() {
    return this._waterboltsCancelled + this._waterboltsCastStarts;
  }

  //checks for difference between player and pet uptime
  get waterElementalUptimeThresholds() {
    return {
      actual: this.petActiveTimePercentage,
      isLessThan: {
        minor: this.abc.activeTimePercentage - 0.1, // eg. player has 83% so the pet can have 73%
        average: this.abc.activeTimePercentage - 0.25,
        major: this.abc.activeTimePercentage - 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  //checks for the time between pull and first action (begin cast/cast/damage) from pet
  get waterElementalPrepullThresholds() {
    return {
      actual: Math.abs(this.prepullSummonCheck),
      isGreaterThan: {
        minor: 5000, //
        average: 10000, // 5 - 10 seconds after pull should give the player time for fetid/mythrax-like pulls
        major: 20000, //
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.waterElementalUptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={TALENTS.SUMMON_WATER_ELEMENTAL_TALENT.id} /> uptime can be improved.
          The uptime of your Water Elemental should more or less mirror your own uptime, higher
          being better. Ensure you have your it summoned pre-pull and that it's always attacking.
        </>,
      )
        .icon(TALENTS.SUMMON_WATER_ELEMENTAL_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.waterElemental.uptime">
            {formatPercentage(actual)}% uptime
          </Trans>,
        )
        .recommended(
          `mirroring your own uptime (${formatPercentage(
            this.abc.activeTimePercentage,
          )}% or more) is recommended`,
        ),
    );
    when(this.waterElementalPrepullThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your Water Elemental should be able to cast Waterbolt right when the fight starts.
          Therefore, cast <SpellLink id={TALENTS.SUMMON_WATER_ELEMENTAL_TALENT.id} /> before the
          fight.
        </>,
      )
        .icon(SPELLS.WATERBOLT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.frostElemental.utilization">
            {this._timestampFirstCast === 0
              ? 'Never attacked or not summoned'
              : 'First attack: ' +
                formatDuration(this._timestampFirstCast - this.owner.fight.start_time) +
                ' into the fight'}
          </Trans>,
        )
        .recommended(`summoning pre-fight is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
        tooltip={
          <>
            Water Elemental was casting for {formatPercentage(this.petActiveTimePercentage)} % of
            the fight (Downtime: {formatPercentage(this.petDowntimePercentage)} %).
            <br />
            Your Water Elemental began casting {this.petTotalCasts} times.
            <br />
            <ul>
              <li>
                {this._waterboltHits} casts dealt a total damage of{' '}
                {formatThousands(this._waterboltDamage)}.
              </li>
              <li>{this._waterboltsCancelled} casts were cancelled.</li>
              <li>
                {this.petTotalCasts - this._waterboltsCancelled - this._waterboltHits} did not hit a
                target in time.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText label="Water Elemental">
          <UptimeIcon /> {formatPercentage(this.petActiveTimePercentage)}% <small>Pet uptime</small>
          <br />
          <CooldownIcon /> {formatNumber(
            this._waterboltDamage / (this.owner.fightDuration / 1000),
          )}{' '}
          <small>Pet DPS</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default WaterElemental;
