import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import AudacityDamageTracker from './AudacityDamageTracker';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { consumedAudacity } from '../../normalizers/CastLinkNormalizer';

//--TODO: maybe a better way to display the delayed/potentially overwritten casts than percentage?
//        maybe separate ss overwrite than ps since ps is much more problematic than ss

class Audacity extends Analyzer {
  procs = 0;
  consumedProcs = 0;

  get thresholds(): NumberThreshold {
    const totalSinister = this.damageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const totalPistol = this.damageTracker.getAbility(SPELLS.PISTOL_SHOT.id);
    const filteredSinister = this.audacityDamageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const filteredPistol = this.audacityDamageTracker.getAbility(SPELLS.PISTOL_SHOT.id);

    return {
      actual:
        (filteredSinister.casts + filteredPistol.casts) / (totalSinister.casts + totalPistol.casts),
      isGreaterThan: {
        minor: 0.01,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    damageTracker: DamageTracker,
    audacityDamageTracker: AudacityDamageTracker,
  };
  protected damageTracker!: DamageTracker;
  protected audacityDamageTracker!: AudacityDamageTracker;

  constructor(options: Options) {
    super(options);

    [Events.applybuff, Events.refreshbuff].forEach((event) =>
      this.addEventListener(
        event.by(SELECTED_PLAYER).spell(SPELLS.AUDACITY_TALENT_BUFF),
        this.onApplyBuff,
      ),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AUDACITY_TALENT_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff() {
    this.procs += 1;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (consumedAudacity(event)) {
      this.consumedProcs += 1;
    }
  }

  get wastedProcs() {
    return this.procs - this.consumedProcs;
  }
}

export default Audacity;
