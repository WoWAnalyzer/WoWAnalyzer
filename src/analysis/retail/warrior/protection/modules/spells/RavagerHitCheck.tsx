import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';
import BoringValue from 'parser/ui/BoringValueText';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const HIT_BUFFER = 200;
const DANCE_OF_DEATH_BUGGED = true;

/**
 * Ravager can hit up to 6 times per cast but since its a ground based ability targets can leave the area.
 * Make sure it hits all times.
 * This is an AoE ability so we need to do timestamp checking... Hate everything
 *
 * Bug: Ravager casted from range will only hit 5 times. This is bad and should only be cast in melee so showing 5/6 is fine (also not checkable)
 * Bug: Dance of Death extends the duration by 2 seconds but doesn't actually proc an extra hit (is checkable so will add boolean flag for when fixed)
 */
class RavagerHitCheck extends Analyzer {
  casts: number = 0;
  ticksHit: number = 0;

  lastHit: number = 0;

  expectedHitsPerCast: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAVAGER_TALENT);
    if (!this.active) {
      return;
    }

    this.expectedHitsPerCast = DANCE_OF_DEATH_BUGGED
      ? 6
      : this.selectedCombatant.hasTalent(TALENTS.DANCE_OF_DEATH_PROTECTION_TALENT)
      ? 7
      : 6;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RAVAGER_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAVAGER_DAMAGE),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    // Since this is an AoE ability we have to make sure we aren't counting duplicate hits on the same tick
    if (this.lastHit + HIT_BUFFER > event.timestamp) {
      return;
    }

    this.lastHit = event.timestamp;
    this.ticksHit += 1;
  }

  get averageTargetsHit() {
    return this.ticksHit / this.casts;
  }

  get averageHitSuggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        major: this.expectedHitsPerCast - 1,
        average: this.expectedHitsPerCast - 0.5,
        minor: this.expectedHitsPerCast - 0.25,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.averageHitSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          <SpellLink spell={TALENTS.RAVAGER_TALENT} /> works in "pulses" where each pulse will do
          damage and generate rage. You should try to make every pulse hit at least 1 target as this
          will increase your damage and rage.
        </>,
      )
        .icon(TALENTS.RAVAGER_TALENT.icon)
        .actual(`${actual} pulses with a hit`)
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={TALENTS.RAVAGER_TALENT} /> Hits per Cast
            </>
          }
        >
          {this.averageTargetsHit}
        </BoringValue>
      </Statistic>
    );
  }
}

export default RavagerHitCheck;
