import { COMET_STORM_AOE_MIN_TARGETS, SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

const MIN_SHATTERED_PROJECTILES_PER_CAST = 4;

class CometStorm extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  cometStorm: { enemiesHit: number[]; shatteredHits: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMET_STORM_TALENT),
      this.onCometCast,
    );
  }

  onCometCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    damage.forEach((d) => {
      const enemy = this.enemies.getEntity(d);
      const enemies: number[] = [];
      if (enemy && enemies.includes(enemy.guid)) {
        enemies.push(enemy.guid);
      }

      let shattered = 0;
      if (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, d.timestamp))) {
        shattered += 1;
      }

      this.cometStorm.push({
        enemiesHit: enemies,
        shatteredHits: shattered,
      });
    });
  }

  get badCasts() {
    return this.cometStorm.filter(
      (cs) =>
        cs.enemiesHit.length < COMET_STORM_AOE_MIN_TARGETS &&
        cs.shatteredHits < MIN_SHATTERED_PROJECTILES_PER_CAST,
    ).length;
  }

  get totalCasts() {
    return this.cometStorm.length;
  }

  get castUtilization() {
    return 1 - this.badCasts / this.totalCasts;
  }

  get cometStormUtilizationThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.cometStormUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to get the most out of your <SpellLink spell={TALENTS.COMET_STORM_TALENT} />{' '}
          casts {this.badCasts} times. Because the projectiles from{' '}
          <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> no longer remove your stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />, you should always cast{' '}
          <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> immediately after casting{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} /> and applying{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />. This way there is time for most/all of the
          comets to hit the target before <SpellLink spell={SPELLS.WINTERS_CHILL} /> expires.
          Alternatively, if <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> will hit at least{' '}
          {COMET_STORM_AOE_MIN_TARGETS} targets, then it is acceptable to use it without{' '}
          <SpellLink spell={TALENTS.SHATTER_TALENT} />/<SpellLink spell={SPELLS.WINTERS_CHILL} />
        </>,
      )
        .icon(TALENTS.COMET_STORM_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default CometStorm;
