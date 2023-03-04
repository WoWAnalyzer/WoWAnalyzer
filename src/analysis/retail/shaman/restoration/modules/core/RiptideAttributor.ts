import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import RiptideTracker from './RiptideTracker';
import talents from 'common/TALENTS/shaman';
import { PRIMAL_TIDE_CORE, HARDCAST, RIPTIDE_PWAVE, UNLEASH_LIFE } from '../../constants';
import HotTracker from 'parser/shared/modules/HotTracker';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import {
  getRiptideCastEvent,
  isFromHardcast,
  isFromPrimalTideCore,
  isRiptideFromPrimordialWave,
} from '../../normalizers/CastLinkNormalizer';
import { isBuffedByUnleashLife } from '../../normalizers/UnleashLifeNormalizer';

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
  uLAttrib = HotTracker.getNewAttribution(UNLEASH_LIFE);

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

    this._checkForUnleashLife(event);
    if (event.prepull || isFromHardcast(event)) {
      this.riptideTracker.addAttributionFromApply(this.hardcastAttrib, event);
    } else if (isRiptideFromPrimordialWave(event)) {
      this.riptideTracker.addAttributionFromApply(this.pwaveAttrib, event);
    } else if (isFromPrimalTideCore(event as ApplyBuffEvent)) {
      this.riptideTracker.addAttributionFromApply(this.ptcAttrib, event);
    }
  }

  private _checkForUnleashLife(event: ApplyBuffEvent | RefreshBuffEvent) {
    //add UL attribution if present
    const castEvent = getRiptideCastEvent(event);
    if (castEvent && isBuffedByUnleashLife(castEvent)) {
      this.riptideTracker.addAttributionFromApply(this.uLAttrib, event);
    }
  }
}

export default RiptideAttributor;
