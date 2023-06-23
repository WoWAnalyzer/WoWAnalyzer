import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

//Example data for bad cast https://wowanalyzer.com/report/g4Pja6pLHnmQtbvk/32-Normal+Sun+King's+Salvation+-+Kill+(10:14)/Zyg/standard
//For Blade dance and Death Sweep
class BladeDance extends Analyzer {
  badCast = 0;
  hitCount = 0;
  firstHitTimeStamp: number = 0;
  strikeTime: number = 1000;
  lastCastEvent?: CastEvent;

  constructor(options: Options) {
    super(options);
    this.active = !(
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT)
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DEATH_SWEEP, SPELLS.BLADE_DANCE]),
      this.onCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DEATH_SWEEP_DAMAGE,
          SPELLS.BLADE_DANCE_DAMAGE,
          SPELLS.BLADE_DANCE_DAMAGE_LAST_HIT,
          SPELLS.DEATH_SWEEP_DAMAGE_LAST_HIT,
        ]),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get suggestionThresholds() {
    return {
      actual: this.badCast,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCast(event: CastEvent) {
    this.lastCastEvent = event;
  }

  onDamage(event: DamageEvent) {
    //Function both for Blade Dance and Death Sweep
    //less than 5 hits = single target, bad cast (with specified talents)
    if (!this.lastCastEvent) {
      return;
    }

    const hitTimeStamp = event.timestamp;

    if (hitTimeStamp > this.firstHitTimeStamp + this.strikeTime) {
      //New Strike
      this.checkIfLastCastIsBad();
      this.firstHitTimeStamp = hitTimeStamp; //Timestamp for first hit in strike
      this.hitCount = 0;
    }
    this.hitCount += 1;
  }

  onFightEnd(_: FightEndEvent) {
    this.checkIfLastCastIsBad();
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          You should not cast <SpellLink spell={SPELLS.BLADE_DANCE} /> or{' '}
          <SpellLink spell={SPELLS.DEATH_SWEEP} /> on single target when you are not using{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT} /> or{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_TALENT} /> as a talent.
        </>,
      )
        .icon(SPELLS.BLADE_DANCE.icon)
        .actual(<>{actual} bad casts</>)
        .recommended(`No bad casts is recommended.`),
    );
  }

  private checkIfLastCastIsBad() {
    if (!this.lastCastEvent) {
      return;
    }

    if (this.hitCount < 5 && this.hitCount > 1) {
      //Check last strike
      this.badCast += 1;
      this.lastCastEvent.meta = this.lastCastEvent.meta || {};
      this.lastCastEvent.meta.isInefficientCast = true;
      this.lastCastEvent.meta.inefficientCastReason = 'Bad cast on single target';
    }
  }
}

export default BladeDance;
