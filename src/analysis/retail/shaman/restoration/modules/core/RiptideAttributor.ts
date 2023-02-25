import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import RiptideTracker from './RiptideTracker';
import talents from 'common/TALENTS/shaman';
import { PRIMAL_TIDE_CORE, HARDCAST, RIPTIDE_PWAVE } from '../../constants';
import HotTracker from 'parser/shared/modules/HotTracker';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import {
  isFromHardcast,
  isFromPrimalTideCore,
  isRiptideFromPrimordialWave,
} from '../../normalizers/CastLinkNormalizer';

class RiptideAttributor extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected riptideTracker!: RiptideTracker;

  hardcastAttrib = HotTracker.getNewAttribution(HARDCAST);
  ptcAttrib = HotTracker.getNewAttribution(PRIMAL_TIDE_CORE);
  pwaveAttrib = HotTracker.getNewAttribution(RIPTIDE_PWAVE);

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onApplyRiptide,
    );
  }

  onApplyRiptide(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (!this.riptideTracker.hots[targetID] || !this.riptideTracker.hots[targetID][spellID]) {
      return;
    }
    if (this._hasAttribution(event)) {
      return;
    }
    if (event.prepull || isFromHardcast(event)) {
      this.riptideTracker.addAttributionFromApply(this.hardcastAttrib, event);
    } else if (isRiptideFromPrimordialWave(event)) {
      this.riptideTracker.addAttributionFromApply(this.pwaveAttrib, event);
    } else if (isFromPrimalTideCore(event as ApplyBuffEvent)) {
      this.riptideTracker.addAttributionFromApply(this.ptcAttrib, event);
    }
  }

  private _hasAttribution(event: ApplyBuffEvent | RefreshBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
      return;
    }
    return this.riptideTracker.hots[targetId][spellId].attributions.length > 0;
  }
}

export default RiptideAttributor;
