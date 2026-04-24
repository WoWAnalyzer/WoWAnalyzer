import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class AspectOfTheTurtle extends MajorDefensiveBuff {
  constructor(options: Options) {
    const trigger = buff(SPELLS.ASPECT_OF_THE_TURTLE);
    trigger.applyTrigger = Events.applybuff
      .spell(SPELLS.ASPECT_OF_THE_TURTLE)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);
    trigger.removeTrigger = Events.removebuff
      .spell(SPELLS.ASPECT_OF_THE_TURTLE)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);
    super(SPELLS.ASPECT_OF_THE_TURTLE, trigger, options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 1),
    });
  }

  description() {
    return (
      <p>
        <SpellLink spell={SPELLS.ASPECT_OF_THE_TURTLE} /> deflects all attacks, making you immune to
        damage for the duration.
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default AspectOfTheTurtle;
