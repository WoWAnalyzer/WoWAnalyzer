import { formatDuration } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, {
  AbilityEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
  GlobalCooldownEvent,
  SourcedEvent,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Haste from 'parser/shared/modules/Haste';

import Abilities from '../../core/modules/Abilities';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import GameBranch from 'game/GameBranch';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
const INVALID_GCD_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives
const MIN_GCD = 750; // Minimum GCD for most abilities is 750ms.
const MIN_GCD_CLASSIC = 1000; // Minimum regular GCD was 1s until Legion

/**
 * This triggers a fabricated `globalcooldown` event when appropriate.
 *
 * This module depends on the beginchannel events fabricated by the ChannelingNormalizer
 * TODO make this also a normalizer that builds off of Channeling
 */
class GlobalCooldown extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
    haste: Haste,
  };

  protected eventEmitter!: EventEmitter;
  protected abilities!: Abilities;
  protected haste!: Haste;

  protected readonly minDuration;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.BeginChannel.by(SELECTED_PLAYER), this.onBeginChannel);
    this.addEventListener(Events.GlobalCooldown.to(SELECTED_PLAYER), this.onGlobalcooldown);

    if (wclGameVersionToBranch(options.owner.report.gameVersion) === GameBranch.Classic) {
      this.minDuration = MIN_GCD_CLASSIC;
    } else {
      this.minDuration = MIN_GCD;
    }
  }

  _errors = 0;
  get errorsPerMinute() {
    const minutesElapsed = this.owner.fightDuration / 1000 / 60;
    return this._errors / minutesElapsed;
  }
  get isAccurate() {
    return this.errorsPerMinute < 2;
  }

  /**
   * Returns true if this ability is on the Global Cooldown, false if not.
   */
  isOnGlobalCooldown(spellId: number): boolean {
    return Boolean(this.getGlobalCooldownDuration(spellId));
  }

  _currentChannel: BeginChannelEvent | EndChannelEvent | null = null;
  /**
   * Listening to `beginchannel` instead of `begincast` since this also includes *channeled* abilities which don't usually trigger a `begincast` event.
   * If the channel of the cast was cancelled before it was finished (in the case of cast-time abilities, not channels), the GCD event will *not* be fired since it will reset upon cancel. We have no way of knowing *when* the cancel is (regardless if it's 100ms into the channel or 1400ms), but in most cases not triggering the entire GCD is enough.
   */
  onBeginChannel(event: BeginChannelEvent) {
    this._currentChannel = event;

    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    // Cancelled casts reset the GCD (only for cast-time spells, "channels" always have a GCD but they also can't be *cancelled*, just ended early)
    let isCancelled = false;
    if (event.trigger && event.trigger.type === EventType.BeginCast) {
      isCancelled = event.trigger.isCancelled;
    }
    //const isCancelled = event.trigger?.isCancelled;
    if (isOnGCD && !isCancelled) {
      event.globalCooldown = this.triggerGlobalCooldown(event);
    }
  }
  /**
   * `cast` events only trigger a GCD if the spell is instant and doesn't have a channeling/casting time.
   */
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      // This ensures we don't crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
      return;
    }
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
      // If it gets registered as a cast, but it's really not an actual cast (See Frenzy being "cast" when a BM Hunter casts Barbed Shot this simply returns so we don't trigger a GCD.
      return;
    }
    // We can't rely on `this.channeling` here since it will have been executed first so will already have marked the channel as ended. This is annoying since it will be more reliable and work with changes.
    const isChanneling = this._currentChannel;
    const isChannelingSameSpell =
      isChanneling && this._currentChannel?.ability.guid === event.ability.guid;

    // Reset the current channel prior to returning if `isChannelingSameSpell`, since the player might cast the same ability again and the second `cast` event might be an instant (e.g. channeled Aimed Shot into proc into instant Aimed Shot).
    this._currentChannel = null;

    if (isChannelingSameSpell) {
      // The GCD occurred already at the start of this channel
      return;
    }
    event.globalCooldown = this.triggerGlobalCooldown(event);
  }

  /**
   * Trigger a `globalcooldown`-event at this timestamp for the `ability` in the provided event.
   * @param event
   */
  triggerGlobalCooldown(event: AbilityEvent<any> & SourcedEvent<any>) {
    if (
      this.lastGlobalCooldown &&
      this.lastGlobalCooldown.timestamp === event.timestamp &&
      this.lastGlobalCooldown.ability.guid === event.ability.guid
    ) {
      this.addDebugAnnotation(event, {
        summary: 'Attempted to trigger duplicate GCD for ability',
        color: OkColor,
      });
      return undefined;
    }
    return this.eventEmitter.fabricateEvent(
      {
        type: EventType.GlobalCooldown,
        ability: event.ability,
        sourceID: event.sourceID,
        targetID: event.sourceID, // no guarantees the original targetID is the player
        timestamp: event.timestamp,
        duration: this.getGlobalCooldownDuration(event.ability.guid),
      },
      event,
    );
  }

  /**
   * Returns the current Global Cooldown duration in milliseconds for the specified spell (some spells have custom GCDs).
   * Typically you should first use isOnGlobalCooldown to check if the spell is on the GCD at all. This function gives
   * a default GCD value if there's no GCD defined for the given spellId.
   */
  getGlobalCooldownDuration(spellId: number): number {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      // Most abilities we don't know (e.g. aren't in the spellbook) also aren't on the GCD
      return 0;
    }
    const gcd = this._resolveAbilityGcdField(ability.gcd);
    if (!gcd) {
      // If gcd isn't set, null, or 0 (falsey), the spell isn't on the GCD. ps. you should set gcd to null to be explicit.
      return 0;
    }
    if (gcd.static !== undefined) {
      return this._resolveAbilityGcdField(gcd.static);
    }
    if (gcd.base) {
      const baseGCD = this._resolveAbilityGcdField(gcd.base);
      const minimumGCD = this._resolveAbilityGcdField(gcd.minimum) || this.minDuration;
      return GlobalCooldown.calculateGlobalCooldown(this.haste.current, baseGCD, minimumGCD);
    }
    throw new Error(
      `Ability ${ability.name} (spellId: ${spellId}) defines a GCD property but provides neither a base nor static value.`,
    );
  }
  _resolveAbilityGcdField(value: any) {
    if (typeof value === 'function') {
      return value.call(this.owner, this.selectedCombatant);
    } else {
      return value;
    }
  }

  /**
   * The last GCD event that occurred, can be used to check if the player is affected by the GCD.
   */
  lastGlobalCooldown: GlobalCooldownEvent | null = null;
  onGlobalcooldown(event: GlobalCooldownEvent) {
    this._verifyAccuracy(event);
  }
  _verifyAccuracy(event: GlobalCooldownEvent) {
    if (this.lastGlobalCooldown) {
      const timeSince = event.timestamp - this.lastGlobalCooldown.timestamp;
      const remainingDuration = this.lastGlobalCooldown.duration - timeSince;
      // the debug annotations are attached to the triggering event so that other annotations (like duplicate gcds) work
      if (remainingDuration > INVALID_GCD_CONFIG_LAG_MARGIN) {
        this._errors += 1;
        this.addDebugAnnotation(event.trigger, {
          summary: `GCD for ${event.trigger?.ability.name} triggered while GCD from ${this.lastGlobalCooldown.ability.name} was active`,
          details: (
            <div>
              <h4>Previous GCD</h4>
              <dl>
                <dt>Timestamp</dt>
                <dd>
                  {formatDuration(
                    this.lastGlobalCooldown.timestamp - this.owner.fight.start_time,
                    2,
                  )}
                </dd>
                <dt>Ability</dt>
                <dd>
                  <SpellLink spell={this.lastGlobalCooldown.ability.guid} />
                </dd>
                <dt>Expected GCD Duration</dt>
                <dd>{(this.lastGlobalCooldown.duration / 1000).toFixed(2)}s</dd>
                <dt>Expected GCD End Timestamp</dt>
                <dd>
                  {formatDuration(
                    this.lastGlobalCooldown.timestamp +
                      this.lastGlobalCooldown.duration -
                      this.owner.fight.start_time,
                    2,
                  )}{' '}
                  ({(remainingDuration / 1000).toFixed(2)}s after this event)
                </dd>
              </dl>
            </div>
          ),
          color: BadColor,
        });
      } else {
        this.addDebugAnnotation(event.trigger, {
          summary: `GCD for ${event.trigger?.ability.name}`,
          color: GoodColor,
          priority: -Infinity,
          details: (
            <div>
              <dl>
                <dt>Expected GCD Duration</dt>
                <dd>{(this.lastGlobalCooldown.duration / 1000).toFixed(2)}s</dd>
              </dl>
            </div>
          ),
        });
      }
    }
    this.lastGlobalCooldown = event;
  }

  /**
   * Calculates the GCD based on the current Haste, taking into account the minimum possible GCD.
   */
  static calculateGlobalCooldown(
    haste: number,
    baseGcd: number = 1500,
    minGcd: number = 750,
  ): number {
    const gcd = baseGcd / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(minGcd, gcd);
  }
}

export default GlobalCooldown;
