import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * This can be quite a large gap since the cooldown of Sundering is `only` 40 seconds.
 */
const CAST_TO_DAMAGE_LATENCY = 1500;

/**
 * Shatters a line of earth in front of you with your main hand weapon,
 * causing (140% of Attack power) Flamestrike damage
 * and Incapacitating any enemy hit for 2 sec.
 *
 * Example Log: https://www.warcraftlogs.com/reports/kAjvaxWdPbpnf8cK#fight=1&type=damage-done&source=12&ability=197214
 */
class Sundering extends Analyzer {
  protected damageGained: number = 0;
  protected casts: number = 0;
  protected hits: number = 0;

  /**
   * Store the casts and remove them when damage occours within {CAST_TO_DAMAGE_INTERVAL} seconds.
   * Leaving only the missed casts.
   */
  protected missedCasts: CastEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.SUNDERING_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUNDERING_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SUNDERING_TALENT),
      this.onDamage,
    );

    this.addEventListener(Events.fightend, this.markBadCasts);
  }

  onDamage(event: DamageEvent) {
    /**
     * Remove casts from missedCasts if the cast was done in the approximate range of the damage
     * time.
     */
    const casts = this.missedCasts.filter(
      (cast) =>
        cast.timestamp >= event.timestamp - CAST_TO_DAMAGE_LATENCY &&
        cast.timestamp <= event.timestamp + CAST_TO_DAMAGE_LATENCY,
    );

    if (casts.length > 0) {
      const index = this.missedCasts.indexOf(casts[0]);
      this.missedCasts.splice(index, 1);
    }

    this.hits += 1;
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    this.missedCasts.push(event);
  }

  /**
   * Mark bad casts on the timeline.
   */
  markBadCasts() {
    this.missedCasts.forEach((cast) => {
      cast.meta = cast.meta || {};
      cast.meta.isInefficientCast = true;
      cast.meta.inefficientCastReason = t({
        id: 'shaman.enhancement.sundering.inefficientCastReason',
        message: 'Sundering did not hit any targets.',
      });
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.SUNDERING_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get misses() {
    return this.missedCasts.length;
  }

  get missesThreshold() {
    return {
      actual: this.misses,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.missesThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="shaman.enhancement.suggestions.sundering.suggest">
          Consider the amount of enemies in the direction you're facing when casting{' '}
          <SpellLink id={SPELLS.SUNDERING_TALENT.id} /> to avoid missing it.
        </Trans>,
      )
        .icon(SPELLS.SUNDERING_TALENT.icon)
        .actual(
          <Trans id="shaman.enhancement.suggestions.sundering.actual">
            You missed {actual} cast(s)
          </Trans>,
        )
        .recommended(
          <Trans id="shaman.enhancement.suggestions.sundering.recommended">0 is recommended</Trans>,
        ),
    );
  }
}

export default Sundering;
