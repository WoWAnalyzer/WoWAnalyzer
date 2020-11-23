import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SHIFTING_POWER_MS_REDUCTION_PER_TICK, SHIFTING_POWER_REDUCTION_SPELLS } from 'parser/mage/shared/constants';

const debug = false;

class ShiftingPower extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER_TICK), this.onShiftingPowerTick);
  }

  onShiftingPowerTick(event: CastEvent) {
    const reductionPerTick = this.selectedCombatant.hasConduitBySpellID(SPELLS.DISCIPLINE_OF_THE_GROVE.id) ? SHIFTING_POWER_MS_REDUCTION_PER_TICK + 1000 : SHIFTING_POWER_MS_REDUCTION_PER_TICK;
    SHIFTING_POWER_REDUCTION_SPELLS.forEach(spell => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        debug && this.log('Reduced ' + spell.name + ' by ' + reductionPerTick);
        this.spellUsable.reduceCooldown(spell.id, reductionPerTick);
      }
    })
  }
}

export default ShiftingPower;
