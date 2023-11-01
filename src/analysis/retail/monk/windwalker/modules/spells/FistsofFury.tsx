import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  GetRelatedEvent,
  HasAbility,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

// Inspired by the penance bolt counter module from Discipline Priest

const FISTS_OF_FURY_MINIMUM_TICK_TIME = 100; // This is to check that additional ticks aren't just hitting secondary targets

class FistsofFury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  previousTickTimestamp = 0;
  nonSerenityFistsTicks = 0;
  nonSerenityCasts = 0;
  lastCastInSerenity = false;

  currentChannelTicks = 0;

  // FoF will always hit one time, so this is ultimately a 1-indexed array of [1,5]
  ticksHit = [0, 0, 0, 0, 0];
  ticksHitSer = [0, 0, 0, 0, 0];
  colors = ['#666', '#1eff00', '#0070ff', '#a435ee', '#ff8000'];

  clipped: { [guid: number]: number } = {};

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_CAST),
      this.onFistsCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_DAMAGE),
      this.onFistsDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_CAST),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_CAST),
      this.onChannelEnd,
    );
  }

  isNewFistsTick(timestamp: number) {
    return (
      !this.previousTickTimestamp ||
      timestamp - this.previousTickTimestamp > FISTS_OF_FURY_MINIMUM_TICK_TIME
    );
  }

  onFistsDamage(event: DamageEvent) {
    if (!this.isNewFistsTick(event.timestamp)) {
      return;
    }
    this.currentChannelTicks += 1;
    if (!this.lastCastInSerenity) {
      this.nonSerenityFistsTicks += 1;
    }
    this.previousTickTimestamp = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.currentChannelTicks > 5) {
      console.log('error, detected too many ticks of fof');
      return;
    }

    if (this.lastCastInSerenity) {
      this.ticksHitSer[this.currentChannelTicks - 1] += 1;
    } else {
      this.ticksHit[this.currentChannelTicks - 1] += 1;
    }
  }

  onChannelEnd(event: EndChannelEvent) {
    const nextAbility = GetRelatedEvent(event, 'fof-cast');
    if (
      nextAbility !== undefined &&
      HasAbility(nextAbility) &&
      this.currentChannelTicks < 5 &&
      this.lastCastInSerenity
    ) {
      // FoF has 5 total damage events, so if the channel ended with less than that we assume it was clipped
      this.clipped[nextAbility.ability.guid] = (this.clipped[nextAbility.ability.guid] || 0) + 1;
    }
  }

  onFistsCast(event: CastEvent) {
    this.currentChannelTicks = 0;
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.SERENITY_TALENT.id)) {
      this.lastCastInSerenity = false;
      this.nonSerenityCasts += 1;
    } else {
      this.lastCastInSerenity = true;
    }
  }

  get averageTicks() {
    return this.nonSerenityFistsTicks / this.nonSerenityCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTicks,
      isLessThan: {
        minor: 5,
        average: 4.75,
        major: 4.5,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  donutChart(ticks: number[]) {
    return Object.values(ticks).map((val, idx) => {
      return { label: idx + 1, color: this.colors[idx], value: val };
    });
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          {' '}
          You are cancelling your <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> casts early and
          losing ticks{' '}
        </span>,
      )
        .icon(SPELLS.FISTS_OF_FURY_CAST.icon)
        .actual(
          defineMessage({
            id: 'monk.windwalker.suggestions.fistOfFury.avgTicksPerCast',
            message: `${actual.toFixed(2)} average ticks on each Fists of Fury cast`,
          }),
        )
        .recommended(`Aim to get ${recommended} ticks with each Fists of Fury cast.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            Fists of Fury ticks 5 times over the duration of the channel
            <br />
            <br />
            Note: During <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} />, Fists of Fury should be
            clipped by <SpellLink spell={SPELLS.RISING_SUN_KICK_DAMAGE} />. The graphs shown below
            are just for information.
          </>
        }
        dropdown={
          <div className="pad">
            <h3>
              Outside of <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} />
            </h3>
            <DonutChart items={this.donutChart(this.ticksHit)} />
            <h3>
              Within <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} />
            </h3>
            <small>
              During Serenity, Fists of Fury should be clipped by{' '}
              <SpellLink spell={SPELLS.RISING_SUN_KICK_DAMAGE} />
            </small>
            <DonutChart items={this.donutChart(this.ticksHitSer)} />
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Times Clipped</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.clipped).map(([key, value], idx) => (
                  <tr key={idx}>
                    <th>
                      <SpellLink spell={Number(key)} />
                    </th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      >
        <BoringSpellValueText spell={SPELLS.FISTS_OF_FURY_CAST}>
          {this.averageTicks.toFixed(2)} <small>Average ticks per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FistsofFury;
