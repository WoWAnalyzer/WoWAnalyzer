import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { BARRAGE_HITS_PER_CAST } from '../constants';

/**
 * Rapidly fires a spray of shots for 3 sec, dealing an average of (80% * 10)
 * Physical damage to all enemies in front of you. Usable while moving.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/wPdQLfFnhTVYRyJm#fight=12&type=damage-done&source=640&ability=120361
 */
class Barrage extends Analyzer {
  damage = 0;
  casts: Array<{ averageHits: number; hits: number }> = [];
  hits = 0;
  uniqueTargets: string[] = [];
  uniqueTargetsHit = 0;
  inefficientCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BARRAGE_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARRAGE_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BARRAGE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.calculateAverageHits);
  }

  get currentCast() {
    if (this.casts.length === 0) {
      return null;
    }

    return this.casts[this.casts.length - 1];
  }

  get barrageInefficientCastsThreshold() {
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

  onCast() {
    this.casts.push({ hits: 0, averageHits: 0 });
    this.uniqueTargets = [];
  }

  onDamage(event: DamageEvent) {
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.uniqueTargetsHit += 1;
      this.uniqueTargets.push(damageTarget);
    }
    const damage = event.amount + (event.absorbed || 0);
    if (this.currentCast !== null) {
      this.currentCast.hits += 1;
    }
    this.hits += 1;
    this.damage += damage;
  }

  calculateAverageHits() {
    this.casts.forEach((cast: { averageHits: number; hits: number }) => {
      cast.averageHits = cast.hits / BARRAGE_HITS_PER_CAST;
      if (cast.averageHits < 1) {
        this.inefficientCasts += 1;
      }
    });
  }

  suggestions(when: When) {
    when(this.barrageInefficientCastsThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.BARRAGE_TALENT.id} /> inefficiently {actual}{' '}
          {actual > 1 ? 'times' : 'time'} throughout the fight. This means you didn't hit all{' '}
          {BARRAGE_HITS_PER_CAST} shots of your barrage channel. Remember to always be facing your
          target when channeling <SpellLink id={SPELLS.BARRAGE_TALENT.id} />.{' '}
        </>,
      )
        .icon(SPELLS.BARRAGE_TALENT.icon)
        .actual(
          t({
            id: 'hunter.shared.suggestions.barrage.efficiency',
            message: `${actual} inefficient ${actual > 1 ? 'casts' : 'cast'}`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.BARRAGE_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <AverageTargetsHit casts={this.casts.length} hits={this.hits} />
            <br />
            <AverageTargetsHit casts={this.casts.length} hits={this.uniqueTargetsHit} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Barrage;
