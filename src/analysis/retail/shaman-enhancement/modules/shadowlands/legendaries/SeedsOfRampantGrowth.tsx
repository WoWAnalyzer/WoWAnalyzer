import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class SeedsOfRampantGrowth extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.SEEDS_OF_RAMPANT_GROWTH);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SEEDS_OF_RAMPANT_GROWTH_BUFF),
      this.reduceFeralSpiritCooldown,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SEEDS_OF_RAMPANT_GROWTH_BUFF),
      this.reduceFeralSpiritCooldown,
    );
  }

  reduceFeralSpiritCooldown(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.FERAL_SPIRIT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FERAL_SPIRIT.id, 9000, event.timestamp);
    }
  }
}

export default SeedsOfRampantGrowth;
