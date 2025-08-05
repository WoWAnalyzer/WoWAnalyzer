import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { TALENTS_PALADIN } from 'common/TALENTS';

class BladeOfJustice extends Analyzer {
  wastedHP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT),
      this.onBladeOfJusticeCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.BLADE_OF_JUSTICE_TALENT),
      this.onBladeOfJusticeEnergize,
    );
  }

  onBladeOfJusticeEnergize(event: ResourceChangeEvent) {
    if (event.waste > 0) {
      this.wastedHP = event.waste;
    }
  }

  onBladeOfJusticeCast(event: CastEvent) {
    if (this.wastedHP > 0) {
      addInefficientCastReason(
        event,
        `Blade of Justice was cast while at ${
          this.wastedHP === 1 ? '4 Holy Power' : 'max Holy Power'
        }. Make sure to either use a ${
          this.wastedHP === 1 ? '1 Holy Power Generator or' : ''
        } Holy Power spender first to avoid overcapping.`,
      );
      this.wastedHP = 0;
    }
  }
}

export default BladeOfJustice;
