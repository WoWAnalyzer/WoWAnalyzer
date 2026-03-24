import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/hunter';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BASE_MITIGATION = 0.3;

class SurvivalOfTheFittest extends MajorDefensiveBuff {
  mitPct: number = BASE_MITIGATION;

  constructor(options: Options) {
    /* 
    Requires a custom trigger on only the SELECTED_PLAYER because each cast of Survival of the Fittest applies 
    to the hunter pet as well and so it creates a cast breakdown for you and your pet with each use.
    */
    const trigger = buff(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT);
    trigger.applyTrigger = Events.applybuff
      .spell(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);
    trigger.removeTrigger = Events.removebuff
      .spell(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);
    super(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT, trigger, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitPct),
    });
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT} /> reduces the damage you take by
        30%.
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default SurvivalOfTheFittest;
