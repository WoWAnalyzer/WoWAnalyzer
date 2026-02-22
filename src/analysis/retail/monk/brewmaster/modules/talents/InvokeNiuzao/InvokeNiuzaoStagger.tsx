import { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import StaggerStatistic from '../../tools/StaggerAnalyzer';
import talents from 'common/TALENTS/monk';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS_COMMON from 'common/SPELLS/monk';

export default class InvokeNiuzaoStagger extends StaggerStatistic {
  constructor(options: Options) {
    super(talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT, options);

    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER_PET).spell(SPELLS_COMMON.NIUZAO_STAGGER_REDIRECTION),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent): void {
    const amount = event.unmitigatedAmount ?? event.amount + (event.absorbed ?? 0);
    this.removeStagger(event, amount);
  }
}
