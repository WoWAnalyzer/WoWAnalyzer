import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class IceLance extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  icelance: { cast: CastEvent; shattered: boolean; hadFingers: boolean; cleaved: boolean }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ICE_LANCE_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    const cleave: DamageEvent | undefined = GetRelatedEvent(event, 'CleaveDamage');
    this.icelance.push({
      cast: event,
      shattered:
        SHATTER_DEBUFFS.some((effect) => enemy?.hasBuff(effect.id, damage?.timestamp)) || false,
      hadFingers: this.selectedCombatant.hasBuff(
        SPELLS.FINGERS_OF_FROST_BUFF.id,
        event.timestamp - 10,
      ),
      cleaved: cleave ? true : false,
    });
  }

  nonShatteredCasts = () => {
    //Get casts that were not shattered
    let badCasts = this.icelance.filter((il) => !il.shattered);

    //If they had Fingers of Frost, disregard it
    badCasts = badCasts.filter((il) => !il.hadFingers);

    const tooltip = `This Ice Lance was not shattered.`;
    badCasts.forEach((e) => e.cast && highlightInefficientCast(e.cast, tooltip));

    return badCasts.length;
  };

  get shatteredPercent() {
    return 1 - this.nonShatteredCasts() / this.icelance.length;
  }

  get nonShatteredIceLanceThresholds() {
    return {
      actual: this.nonShatteredCasts() / this.icelance.length,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.nonShatteredIceLanceThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.ICE_LANCE_TALENT} /> {this.nonShatteredCasts()} times (
          {formatPercentage(actual)}%) without <SpellLink spell={TALENTS.SHATTER_TALENT} />. Make
          sure that you are only casting Ice Lance when the target has{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> (or other Shatter effects), if you have a{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> proc, or if you are moving and you
          cant cast anything else.
        </>,
      )
        .icon(TALENTS.ICE_LANCE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% missed`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip="This is the percentage of Ice Lance casts that were shattered. The only time it is acceptable to cast Ice Lance without Shatter is if you are moving and you cant use anything else."
      >
        <BoringSpellValueText spell={TALENTS.ICE_LANCE_TALENT}>
          {`${formatPercentage(this.shatteredPercent, 0)}%`} <small>Casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceLance;
