import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

class RayOfFrost extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  rayOfFrost: { hits: number; shatteredHits: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RAY_OF_FROST_TALENT),
      this.onRayCast,
    );
  }

  onRayCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    let shattered = 0;
    damage.forEach((d) => {
      const enemy = this.enemies.getEntity(d);
      if (SHATTER_DEBUFFS.some((effect) => enemy?.hasBuff(effect.id, d.timestamp))) {
        shattered += 1;
      }
    });

    this.rayOfFrost.push({
      hits: damage.length,
      shatteredHits: shattered,
    });
  }

  get badCasts() {
    return this.rayOfFrost.filter((r) => r.shatteredHits < 2 || r.hits < 4).length;
  }

  get totalCasts() {
    return this.rayOfFrost.length;
  }

  get castUtilization() {
    return 1 - this.badCasts / this.totalCasts;
  }

  get rayOfFrostUtilizationThresholds() {
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
    when(this.rayOfFrostUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to get the most out of your <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />{' '}
          casts {this.badCasts} times. Because the ticks from{' '}
          <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} /> do not remove your stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />, you should always cast{' '}
          <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} /> during{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />. However, because{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> has such a short duration and therefore will
          likely naturally end before <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} /> finishes,
          you should spend your first stack of <SpellLink spell={SPELLS.WINTERS_CHILL} /> and then
          cast <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} /> instead of spending the 2nd stack.
        </>,
      )
        .icon(TALENTS.RAY_OF_FROST_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RayOfFrost;
