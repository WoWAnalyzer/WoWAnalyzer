import SPELLS from 'common/SPELLS/monk';
import TALENTS from 'common/TALENTS/monk';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  CastEvent,
  DamageEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import { triggeredGloryOfTheDawnFromRushingWindKick } from 'analysis/retail/monk/windwalker/normalizers/GloryOfTheDawnLinkNormalizer';
import { getLateXuensBattlegearTriggers } from 'analysis/retail/monk/windwalker/normalizers/XuensBattlegearNormalizer';

const TOTM_CONSUME_WINDOW_MS = 400;
const XUENS_BATTLEGEAR_FOF_CDR_MS = 4000;
const debug = false;

type PreAppliedXuensBattlegearDamageEvent = DamageEvent & {
  preAppliedXuensBattlegearReductionMs?: number;
};

// Override spell usable to handle CD resets on RSK from Teachings of the Monastery
// There is no direct event to observe, so if we detect RSK being used earlier than its CD dictates,
// we assume the most recent Blackout Kick reset the cooldown
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRskReset: CastEvent | null = null;
  lastPotentialTriggerForMissingGotdCrit: CastEvent | DamageEvent | null = null;
  lastBlackoutKickTimestamp = 0;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK_TOTM),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onTotmConsumed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onTotmConsumed,
    );
    const tracksHiddenGotdCrit =
      this.selectedCombatant.hasTalent(TALENTS.RUSHING_WIND_KICK_WINDWALKER_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.GLORY_OF_THE_DAWN_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.XUENS_BATTLEGEAR_TALENT);

    if (tracksHiddenGotdCrit) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_CAST),
        this.onRushingWindKickCast,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_DAMAGE),
        this.onRushingWindKickDamage,
      );
    }
  }

  onBlackoutKick(event: CastEvent) {
    this.lastBlackoutKickTimestamp = event.timestamp;
    this.lastPotentialTriggerForRskReset = event;
  }

  onTotmConsumed(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (event.timestamp - this.lastBlackoutKickTimestamp > TOTM_CONSUME_WINDOW_MS) {
      return;
    }

    // Logs often omit a distinct BLACKOUT_KICK_TOTM cast event, so treat TotM
    // consumption as another possible hidden RSK reset trigger.
    if (this.lastPotentialTriggerForRskReset !== null) {
      this.lastPotentialTriggerForRskReset = {
        ...this.lastPotentialTriggerForRskReset,
        timestamp: event.timestamp,
      };
    }
  }

  onRushingWindKickCast(event: CastEvent) {
    // RWK's damage can land after a subsequent FoF cast, and the GoTD follow-up can be missing
    // entirely if it procs beyond GoTD's shorter range.
    this.lastPotentialTriggerForMissingGotdCrit = event;
  }

  onRushingWindKickDamage(event: DamageEvent) {
    // Update the pending trigger to the actual damage timestamp once the hit lands.
    this.lastPotentialTriggerForMissingGotdCrit = event;
  }

  private preApplyLateXuensBattlegearReductions(event: CastEvent) {
    for (const triggerEvent of getLateXuensBattlegearTriggers(event)) {
      const isCrit =
        triggerEvent.hitType === HIT_TYPES.CRIT || triggerEvent.hitType === HIT_TYPES.BLOCKED_CRIT;
      if (!isCrit) {
        continue;
      }

      const reductionMs = this.reduceCooldown(
        SPELLS.FISTS_OF_FURY_CAST.id,
        XUENS_BATTLEGEAR_FOF_CDR_MS,
        event.timestamp,
      );
      (triggerEvent as PreAppliedXuensBattlegearDamageEvent).preAppliedXuensBattlegearReductionMs =
        reductionMs;
    }
  }

  beginCooldown(triggerEvent: AbilityEvent<EventType>, _spellId: number) {
    if (triggerEvent.type === EventType.FreeCast) {
      //Ignore FreeCast events as they are events that have been modified or fabricated
      //They indicate that a different spell caused it to cast
      return;
    }
    const spellId = triggerEvent.ability.guid;
    if (spellId === TALENTS.RISING_SUN_KICK_TALENT.id) {
      if (
        this.selectedCombatant.hasTalent(TALENTS.TEACHINGS_OF_THE_MONASTERY_TALENT) &&
        this.isOnCooldown(spellId) &&
        this.chargesAvailable(spellId) === 0 &&
        this.lastPotentialTriggerForRskReset !== null
      ) {
        // set the reset time as 1ms AFTER we casted BoK so that the APL / timeline doesn't
        //   think we should have instead cast RSK during that gcd
        this.endCooldown(spellId, this.lastPotentialTriggerForRskReset.timestamp + 1);

        // flag the reset event in the timeline
        addEnhancedCastReason(
          this.lastPotentialTriggerForRskReset,
          <>
            This cast reset the cooldown of <SpellLink spell={TALENTS.RISING_SUN_KICK_TALENT} /> due
            to <SpellLink spell={TALENTS.TEACHINGS_OF_THE_MONASTERY_TALENT} />
          </>,
        );
      }
      this.lastPotentialTriggerForRskReset = null;
    }
    if (spellId === SPELLS.FISTS_OF_FURY_CAST.id) {
      this.preApplyLateXuensBattlegearReductions(triggerEvent as CastEvent);

      const missingGotdCritTrigger = this.lastPotentialTriggerForMissingGotdCrit;
      if (
        this.isOnCooldown(spellId) &&
        this.chargesAvailable(spellId) === 0 &&
        missingGotdCritTrigger !== null &&
        !(
          missingGotdCritTrigger.type === EventType.Damage &&
          triggeredGloryOfTheDawnFromRushingWindKick(missingGotdCritTrigger)
        )
      ) {
        // Apply only the hidden GoTD crit's 4s Xuen's Battlegear reduction. If FoF is still not
        // available afterwards, let CoreSpellUsable continue to flag the remaining mismatch.
        const reductionMs = this.reduceCooldown(
          spellId,
          XUENS_BATTLEGEAR_FOF_CDR_MS,
          triggerEvent.timestamp,
        );

        debug &&
          reductionMs > 0 &&
          this.log(
            `Applied hidden GoTD/Xuen FoF reduction of ${reductionMs}ms at ${this.owner.formatTimestamp(triggerEvent.timestamp, 1)}`,
          );
      }
      this.lastPotentialTriggerForMissingGotdCrit = null;
    }

    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
