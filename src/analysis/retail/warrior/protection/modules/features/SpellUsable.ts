import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { AbilityEvent, CastEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/warrior';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    globalCooldown: GlobalCooldown,
  };
  hasDevastator: boolean;
  lastPotentialTriggerForShieldSlam: CastEvent | null = null;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);
    this.hasDevastator = this.selectedCombatant.hasTalent(TALENTS.DEVASTATOR_TALENT);
  }

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MELEE.id && this.hasDevastator) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (
      spellId === SPELLS.DEVASTATE.id ||
      spellId === SPELLS.THUNDER_CLAP.id ||
      spellId === SPELLS.REVENGE.id
    ) {
      this.lastPotentialTriggerForShieldSlam = { ...event };
      //reset the cooldown to after the GCD of the resetting ability
      this.lastPotentialTriggerForShieldSlam.timestamp += this.globalCooldown.getGlobalCooldownDuration(
        spellId,
      );
    } else if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.lastPotentialTriggerForShieldSlam = null;
    }
  }

  beginCooldown(cooldownTriggerEvent: AbilityEvent<any>, spellId: number) {
    if (spellId === SPELLS.SHIELD_SLAM.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(
          spellId,
          this.lastPotentialTriggerForShieldSlam
            ? this.lastPotentialTriggerForShieldSlam.timestamp
            : undefined,
        );
      }
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
