import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

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
    if (!this.lastCastInSerenity) {
      this.nonSerenityFistsTicks += 1;
    }
    this.previousTickTimestamp = event.timestamp;
  }

  onFistsCast(event: CastEvent) {
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          {' '}
          You are cancelling your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> casts early and
          losing ticks{' '}
        </span>,
      )
        .icon(SPELLS.FISTS_OF_FURY_CAST.icon)
        .actual(`${actual.toFixed(2)} average ticks on each Fists of Fury cast`)
        .recommended(`Aim to get ${recommended} ticks with each Fists of Fury cast.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip="Fists of Fury ticks 5 times over the duration of the channel"
      >
        <BoringSpellValueText spellId={SPELLS.FISTS_OF_FURY_CAST.id}>
          {this.averageTicks.toFixed(2)} <small>Average ticks per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FistsofFury;
