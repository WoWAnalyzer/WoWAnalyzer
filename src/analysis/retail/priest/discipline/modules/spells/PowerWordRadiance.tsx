import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Atonement from './Atonement';

type RadianceInfo = {
  cast: CastEvent;
  goodCast: boolean;
  onAtoned: boolean;
};

class PowerWordRadiance extends Analyzer {
  radianceCasts: RadianceInfo[] = [];
  radAtones = 0;
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };
  protected atonement!: Atonement;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.onRadiance,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.onRadianceAtone,
    );
  }

  onRadiance(event: CastEvent) {
    const target = this.combatants.getEntity(event);
    const castInfo = { cast: event, goodCast: false, onAtoned: false };

    if (target?.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      castInfo.onAtoned = true;
    }
    this.radianceCasts.push(castInfo);
  }

  onRadianceAtone(event: ApplyBuffEvent) {
    if (this.radianceCasts.length === 0) {
      return;
    }

    if (event.timestamp === this.radianceCasts[this.radianceCasts.length - 1].cast.timestamp) {
      this.radAtones += 1;
      if (this.radAtones === 5) {
        this.radAtones = 0;
        this.radianceCasts[this.radianceCasts.length - 1].goodCast = true;
      }
    } else {
      this.radAtones = 0;
    }
  }
}

export default PowerWordRadiance;
