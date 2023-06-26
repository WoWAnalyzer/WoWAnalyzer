import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/paladin';

class CrusaderStrike extends Analyzer {
  wasteHP = false;

  constructor(options: Options) {
    super(options);

    this.active = !this.selectedCombatant.hasTalent(TALENTS.CRUSADING_STRIKES_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCrusaderStrikeCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCrusaderStrikeEnergize,
    );
  }

  onCrusaderStrikeEnergize(event: ResourceChangeEvent) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onCrusaderStrikeCast(event: CastEvent) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason =
        'Crusader Strike was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default CrusaderStrike;
