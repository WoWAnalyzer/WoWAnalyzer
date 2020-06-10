import { t } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { i18n } from 'interface/RootLocalizationProvider';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';

class InefficientLightOfTheMartyrs extends Analyzer {
  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR),
      this.handleHeal,
    );
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN),
      this.handleDamage,
    );
  }

  protected lastCast: CastEvent | undefined;
  protected handleCast(event: CastEvent) {
    this.lastCast = event;
  }
  protected lastHeal: HealEvent | undefined;
  protected handleHeal(event: HealEvent) {
    this.lastHeal = event;
  }
  protected lastDamage: DamageEvent | undefined;
  protected handleDamage(event: DamageEvent) {
    this.lastDamage = event;
    this.check();
  }

  protected check() {
    const cast = this.lastCast;
    const heal = this.lastHeal;
    const damage = this.lastDamage;
    if (!cast || !heal || !damage) {
      console.log(cast, heal, damage);
      throw new Error('Missing an event');
    }

    const healingDone = heal.amount + (heal.absorbed || 0);
    const damageTaken = damage.amount + (damage.absorbed || 0);

    const effectiveHealing = healingDone - damageTaken;
    if (effectiveHealing <= 0) {
      cast.meta = cast.meta || {};
      cast.meta.isInefficientCast = true;
      cast.meta.inefficientCastReason = i18n._(
        t`This cast dealt more damage to you than it healed the target. If there is nothing to heal you, deal damage instead.`,
      );
    }

    this.lastCast = undefined;
    this.lastHeal = undefined;
    this.lastDamage = undefined;
  }
}

export default InefficientLightOfTheMartyrs;
