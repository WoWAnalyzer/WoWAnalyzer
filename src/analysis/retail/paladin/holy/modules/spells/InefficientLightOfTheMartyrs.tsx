import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';

class InefficientLightOfTheMartyrs extends Analyzer {
  // have to track over multiple events when player has Maraad's talent
  // in these cases we'll have a little inaccuracy when DoT is refreshed, but should be close enough
  /** tracks damage taken from LotM since last heal */
  damageTakenSinceLast: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.MARAADS_DYING_BREATH_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LIGHT_OF_THE_MARTYR_TALENT),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.LIGHT_OF_THE_MARTYR_TALENT),
      this.handleHeal,
    );
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN),
      this.handleDamage,
    );
  }

  protected lastCast: CastEvent | undefined;
  protected handleCast(event: CastEvent) {
    this.damageTakenSinceLast = 0;
    this.lastCast = event;
  }
  protected lastHeal: HealEvent | undefined;
  protected handleHeal(event: HealEvent) {
    this.damageTakenSinceLast = 0;
    this.lastHeal = event;
  }
  protected handleDamage(event: DamageEvent) {
    //This is most likely a precast and should be ignored.
    if (!this.lastCast || !this.lastHeal) {
      return;
    }
    this.damageTakenSinceLast += event.amount + (event.absorbed || 0);
    this.check();
  }

  protected check() {
    const cast = this.lastCast;
    const heal = this.lastHeal;
    if (!cast || !heal) {
      console.log(cast, heal);
      throw new Error('Missing an event');
    }

    const healingDone = heal.amount + (heal.absorbed || 0);

    const effectiveHealing = healingDone - this.damageTakenSinceLast;
    if (effectiveHealing <= 0) {
      cast.meta = cast.meta || {};
      cast.meta.isInefficientCast = true;
      cast.meta.inefficientCastReason = defineMessage({
        id: 'paladin.holy.timeline.badLotM',
        message: `This cast dealt more damage to you than it healed the target. If there is nothing to heal, you should deal damage instead.`,
      });
    }
  }
}

export default InefficientLightOfTheMartyrs;
