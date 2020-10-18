import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { AnyEvent, CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    globalCooldown: GlobalCooldown,
  };
  protected globalCooldown!: GlobalCooldown;

  hasDevastator: boolean;

  constructor(options: Options) {
    super(options);
    this.hasDevastator = this.selectedCombatant.hasTalent(SPELLS.DEVASTATOR_TALENT.id);
  }

  lastPotentialTriggerForShieldSlam: CastEvent | null = null;

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MELEE.id && this.hasDevastator) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (spellId === SPELLS.DEVASTATE.id || spellId === SPELLS.THUNDER_CLAP.id || spellId === SPELLS.REVENGE.id) {
      this.lastPotentialTriggerForShieldSlam = { ...event };
      //reset the cooldown to after the GCD of the resetting ability
      this.lastPotentialTriggerForShieldSlam.timestamp += this.globalCooldown.getGlobalCooldownDuration(spellId);
    } else if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.lastPotentialTriggerForShieldSlam = null;
    }
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: AnyEvent) {
    if (spellId === SPELLS.SHIELD_SLAM.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForShieldSlam ? this.lastPotentialTriggerForShieldSlam.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
