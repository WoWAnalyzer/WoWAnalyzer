import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Module';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';

import { ARCHON_CONCENTRATED_INFUSION_HASTE } from '../../../constants';

class ConcentratedInfusion extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.CONCENTRATED_INFUSION_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.POWER_INFUSION_TALENT),
      this.onPIApply,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.POWER_INFUSION_TALENT),
      this.onPIRemove,
    );
  }

  onPIApply(event: ApplyBuffEvent) {
    this.haste._applyHasteGain(event, ARCHON_CONCENTRATED_INFUSION_HASTE);
  }

  onPIRemove(event: RemoveBuffEvent) {
    this.haste._applyHasteLoss(event, ARCHON_CONCENTRATED_INFUSION_HASTE);
  }
}
export default ConcentratedInfusion;
