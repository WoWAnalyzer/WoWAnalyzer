import { defineMessage } from '@lingui/macro';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Attack all nearby enemies in a flurry of strikes, inflicting Physical damage to each. Deals reduced damage beyond 5 targets.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GcyfdwP1XTJrR3h7#fight=15&source=8&type=damage-done&ability=212436
 */

class Butchery extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private targetsHit: number = 0;
  private casts: number = 0;
  private damage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BUTCHERY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.BUTCHERY_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BUTCHERY_TALENT),
      this.onCast,
    );
  }

  get avgTargetsHitThreshold() {
    return {
      actual: Number((this.targetsHit / this.casts).toFixed(1)),
      isLessThan: {
        minor: 2,
        average: 2,
        major: 2,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.targetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  suggestions(when: When) {
    // Since you're not casting Butchery or Carve on single-target, there's no reason to show the statistics in cases where the abilities were cast 0 times.
    if (this.casts <= 0) {
      return;
    }

    when(this.avgTargetsHitThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should aim to hit as many targets as possible with{' '}
          <SpellLink spell={TALENTS.BUTCHERY_TALENT} />. Using it on single-target is not
          recommended.
        </>,
      )
        .icon(TALENTS.BUTCHERY_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.butcheryCarve.averageTargets',
            message: `${actual} average targets hit per cast`,
          }),
        )
        .recommended(`>${recommended} is recommended`),
    );
  }

  statistic() {
    // Since you're not casting Butchery or Carve on single-target, there's no reason to show the statistics in cases where the abilities were cast 0 times.
    if (this.casts <= 0) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.BUTCHERY_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.targetsHit} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Butchery;
