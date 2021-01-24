import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyDebuffStackEvent, RemoveDebuffStackEvent, RemoveDebuffEvent, ApplyDebuffEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

class WoundTracker extends Analyzer {  
  private _targets: { [key: string]: number; } = {};

  public get targets(): { [key: string]: number; } {
    return this._targets;
  }
  
  constructor(options: Options) {
    super(options);
    
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onFesteringWoundChange);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onFesteringWoundChange);
    this.addEventListener(Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onFesteringWoundChange);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND), this.onFesteringWoundChange);
  }

  onFesteringWoundChange(event: ApplyDebuffEvent | ApplyDebuffStackEvent | RemoveDebuffStackEvent | RemoveDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = currentStacks(event);
  }
  
}

export default WoundTracker;