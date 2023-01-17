import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const TRIGGER_COUNT_CAP = 10;
const CDR_MS = 500;

/**
 * Attenuation reduces the cooldown of BDB whenever it deals damage / heals, with an (undocumented) cap of 10 CDR events per cast. There is no RNG involved in which triggers provide CDR---it is always the first 10.
 */
export default class Attenuation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private triggersSinceCast = 0;
  totalCdr = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.ATTENUATION_TALENT);

    this.addEventListener(Events.cast.spell(talents.BONEDUST_BREW_TALENT), this.resetTriggerCount);
    this.addEventListener(
      Events.damage.spell(SPELLS.BONEDUST_BREW_DAMAGE).by(SELECTED_PLAYER),
      this.reduceCooldown,
    );
    this.addEventListener(
      Events.heal.spell(SPELLS.BONEDUST_BREW_HEAL).by(SELECTED_PLAYER),
      this.reduceCooldown,
    );
  }

  private resetTriggerCount() {
    this.triggersSinceCast = 0;
  }

  private reduceCooldown(event: DamageEvent | HealEvent) {
    if (this.triggersSinceCast >= TRIGGER_COUNT_CAP) {
      return; // already hit the cap on number of CDR events
    }

    this.triggersSinceCast += 1;
    this.totalCdr += this.spellUsable.reduceCooldown(
      talents.BONEDUST_BREW_TALENT.id,
      CDR_MS,
      event.timestamp,
    );
  }
}
