import Analyzer, { Options } from 'parser/core/Analyzer';
import { ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_SHAMAN } from 'common/TALENTS';

class SeedsOfRampantGrowth extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = false;

    // this.addEventListener(
    //   Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SEEDS_OF_RAMPANT_GROWTH_BUFF),
    //   this.reduceFeralSpiritCooldown,
    // );
    //
    // this.addEventListener(
    //   Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SEEDS_OF_RAMPANT_GROWTH_BUFF),
    //   this.reduceFeralSpiritCooldown,
    // );
  }

  reduceFeralSpiritCooldown(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id, 9000, event.timestamp);
    }
  }
}

export default SeedsOfRampantGrowth;
