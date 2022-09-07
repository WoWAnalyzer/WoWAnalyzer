import { Trans } from '@lingui/macro';
import { STAMPEDE_POTENTIAL_HITS } from 'analysis/retail/hunter/beastmastery/constants';
import { formatMilliseconds, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Summon a herd of stampeding animals from the wilds around you that deal damage to your enemies for 12 sec.
 *
 * Example log that triggers the warning for one cast, but also has 1 good cast:
 * https://www.warcraftlogs.com/reports/1xBcaN8kyADHdhjG#fight=9&type=damage-done&source=176&ability=201594
 */
class Stampede extends Analyzer {
  casts: Array<{ timestamp: number; damage: number; hits: number; averageHits: number }> = [];
  damage = 0;
  hits = 0;
  averageHits = 0;
  inefficientCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STAMPEDE_TALENT.id);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STAMPEDE_TALENT),
      this.onStampedeApply,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STAMPEDE_DAMAGE),
      this.onStampedeDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get currentCast() {
    if (this.casts.length === 0) {
      return null;
    }
    return this.casts[this.casts.length - 1];
  }

  get stampedeInefficientCastsThreshold() {
    return {
      actual: this.inefficientCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onStampedeApply(event: ApplyBuffEvent) {
    this.casts.push({
      timestamp: event.timestamp,
      damage: 0,
      hits: 0,
      averageHits: 0,
    });
  }

  onStampedeDamage(event: DamageEvent) {
    const damage = event.amount + (event.absorbed || 0);
    this.hits += 1;
    this.damage += damage;

    if (this.currentCast !== null) {
      this.currentCast.hits += 1;
      this.currentCast.damage += damage;
    }
  }

  onFightEnd() {
    this.averageHits = this.hits / this.casts.length / STAMPEDE_POTENTIAL_HITS;
    this.casts.forEach((cast: { averageHits: number; hits: number }) => {
      cast.averageHits = cast.hits / STAMPEDE_POTENTIAL_HITS;
      if (cast.averageHits < 1) {
        this.inefficientCasts += 1;
      }
    });
  }

  suggestions(when: When) {
    when(this.stampedeInefficientCastsThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.STAMPEDE_TALENT.id} /> inefficiently {actual}{' '}
          {actual > 1 ? 'times' : 'time'} throughout the fight. This means you've placed{' '}
          <SpellLink id={SPELLS.STAMPEDE_TALENT.id} /> at a place where it was impossible for it to
          deal it's full damage, or the enemy moved out of it. Avoid using{' '}
          <SpellLink id={SPELLS.STAMPEDE_TALENT.id} /> on moments where it's likely the enemy will
          be moving out of it.
        </>,
      )
        .icon(SPELLS.STAMPEDE_TALENT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.stampede.efficiency">
            {actual} inefficient {actual > 1 ? 'casts' : 'cast'}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.stampede.recommended">
            {recommended} is recommended
          </Trans>,
        ),
    );
  }

  statistic() {
    if (this.casts.length > 0) {
      const averageHit = this.damage / this.hits;
      const stampedePlural =
        this.casts.length === 1 ? `1 Stampede` : `a total of ${this.casts.length} Stampedes`;
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(13)}
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
          tooltip={
            <>
              You cast {stampedePlural} in the fight, which hit enemies {this.hits} times for an
              average of {formatNumber(averageHit)} damage per hit.
            </>
          }
          dropdown={
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Cast at</th>
                    <th>Damage</th>
                    <th>Hits</th>
                    <th>Avg hit</th>
                  </tr>
                </thead>
                <tbody>
                  {this.casts.map((cast, idx) => (
                    <tr key={idx}>
                      <td>{formatMilliseconds(cast.timestamp - this.owner.fight.start_time)}</td>
                      <td>{formatNumber(cast.damage)}</td>
                      <td>{cast.hits}</td>
                      <td>{formatNumber(cast.damage / cast.hits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          }
        >
          <BoringSpellValueText spellId={SPELLS.STAMPEDE_TALENT.id}>
            <>
              <ItemDamageDone amount={this.damage} />
              <br />
              {this.casts.length} {this.casts.length > 1 ? 'casts' : 'cast'} / {this.hits} hits
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    }
    return null;
  }
}

export default Stampede;
