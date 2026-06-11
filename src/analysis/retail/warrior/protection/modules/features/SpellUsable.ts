import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/warrior';

const COOLDOWN_LAG_BUFFER_MS = 250;
const THUNDER_CLAP_COOLDOWN_LAG_BUFFER_MS = 2000;

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

    // WCL exposes some Shield Slam resets as buff events instead of cooldown events
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM_RESET_BUFF),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM_RESET_BUFF),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onShieldSlamReset,
    );
  }

  onShieldSlamReset(event: ApplyBuffEvent | RefreshBuffEvent) {
    // Explicit reset signals are more accurate than the Strategist fallback
    this.endCooldown(SPELLS.SHIELD_SLAM.id, event.timestamp);
    this.lastPotentialTriggerForShieldSlam = null;
  }

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MELEE.id && this.hasDevastator) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (
      // Strategist Shield Slam resets are not directly logged. If Shield Slam is cast before
      // our tracker expected it, backdate the reset to the last spell that could have procced it
      spellId === SPELLS.DEVASTATE.id ||
      spellId === SPELLS.EXECUTE.id ||
      spellId === SPELLS.THUNDER_CLAP.id ||
      spellId === SPELLS.THUNDER_BLAST.id ||
      spellId === SPELLS.REVENGE.id
    ) {
      this.lastPotentialTriggerForShieldSlam = { ...event };
      // Reset the cooldown after the GCD of the likely proc trigger
      this.lastPotentialTriggerForShieldSlam.timestamp +=
        this.globalCooldown.getGlobalCooldownDuration(spellId);
    } else if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.lastPotentialTriggerForShieldSlam = null;
    }
  }

  beginCooldown(
    cooldownTriggerEvent: AbilityEvent<any>,
    spellId = cooldownTriggerEvent.ability.guid,
  ) {
    if (spellId === SPELLS.SHIELD_SLAM.id) {
      if (this.isOnCooldown(spellId) && this.lastPotentialTriggerForShieldSlam) {
        // Backdate inferred Strategist resets to the last plausible trigger
        this.endCooldown(
          spellId,
          Math.min(
            this.lastPotentialTriggerForShieldSlam.timestamp,
            cooldownTriggerEvent.timestamp,
          ),
        );
      }
    } else if (
      this.isOnCooldown(spellId) &&
      this.cooldownRemaining(spellId, cooldownTriggerEvent.timestamp) <=
        this.getCooldownLagBuffer(spellId)
    ) {
      // Treat small early casts as natural cooldown completions with loose WCL timestamps
      this.endCooldown(spellId, cooldownTriggerEvent.timestamp);
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }

  private getCooldownLagBuffer(spellId: number): number {
    if (spellId === SPELLS.THUNDER_CLAP.id) {
      // Thunder Clap has several proc and rate-change paths that WCL timestamps loosely
      return THUNDER_CLAP_COOLDOWN_LAG_BUFFER_MS;
    }
    return COOLDOWN_LAG_BUFFER_MS;
  }
}

export default SpellUsable;
