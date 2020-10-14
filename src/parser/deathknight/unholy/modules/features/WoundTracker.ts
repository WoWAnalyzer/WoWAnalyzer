import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyDebuffStackEvent, RemoveDebuffStackEvent, RemoveDebuffEvent, ApplyDebuffEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

class WoundTracker extends Analyzer {  
  private _targets: { [key: string]: number; } = {};

  public get targets(): { [key: string]: number; } {
    return this._targets;
  }
  
  constructor(options: Options) {
    super(options);
    
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onFirstWoundApply);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundApply);
    this.addEventListener(Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onWoundRemove);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onAllWoundRemove);
  }

  onFirstWoundApply(event: ApplyDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = 1;
  }

  onWoundApply(event: ApplyDebuffStackEvent) {
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
  }

  onWoundRemove(event: RemoveDebuffStackEvent) {
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
  }

  onAllWoundRemove(event: RemoveDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = 0;
  }
  
}

export default WoundTracker;