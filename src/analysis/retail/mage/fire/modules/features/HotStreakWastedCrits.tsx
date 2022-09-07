import { Trans } from '@lingui/macro';
import { MS_BUFFER_250, FIRE_DIRECT_DAMAGE_SPELLS } from 'analysis/retail/mage/shared';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  HasTarget,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';

const debug = false;

class HotStreakWastedCrits extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hasPyromaniac: boolean;
  lastCastEvent?: CastEvent;
  wastedCrits = 0;
  hasPyromaniacProc = false;
  pyromaniacProc = false;
  hotStreakRemoved = 0;

  constructor(options: Options) {
    super(options);
    this.hasPyromaniac = this.selectedCombatant.hasTalent(SPELLS.PYROMANIAC_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.onDamage,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
      this.checkForPyromaniacProc,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK),
      this.onHotStreakRemoved,
    );
  }

  //When a spell that contributes towards Hot Streak is cast, get the event info to use for excluding the cleaves from Phoenix Flames on the damage event.
  onCast(event: CastEvent) {
    this.lastCastEvent = event;
  }

  //When a spell that contributes towards Hot Streak crits the target while Hot Streak is active, count it as a wasted crit.
  //Excludes the cleave from Phoenix Flames (the cleave doesnt contribute towards Hot Streak) and excludes crits immediately after Pyromaniac procs, cause the player cant do anything to prevent that.
  onDamage(event: DamageEvent) {
    if (!this.lastCastEvent) {
      return;
    }
    if (!HasTarget(this.lastCastEvent)) {
      return;
    }
    const spellId = event.ability.guid;
    const castTarget = encodeTargetString(this.lastCastEvent.targetID, event.targetInstance);
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (
      event.hitType !== HIT_TYPES.CRIT ||
      !this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id, undefined, -50) ||
      (spellId === SPELLS.PHOENIX_FLAMES.id && castTarget !== damageTarget)
    ) {
      return;
    }

    if (this.hasPyromaniacProc) {
      debug && this.log('Wasted Crit Ignored');
    } else {
      this.wastedCrits += 1;
      this.lastCastEvent.meta = this.lastCastEvent.meta || {};
      this.lastCastEvent.meta.isInefficientCast = true;
      this.lastCastEvent.meta.inefficientCastReason =
        'This cast crit while you already had Hot Streak and could have contributed towards your next Heating Up or Hot Streak. To avoid this, make sure you use your Hot Streak procs as soon as possible.';
      debug && this.log('Wasted Crit');
    }
  }

  //Pyromaniac doesnt trigger an event, so we need to check to see if the player immediately got a new Hot Streak immediately after using a Hot Streak
  checkForPyromaniacProc(event: ApplyBuffEvent) {
    if (this.hasPyromaniac && event.timestamp - this.hotStreakRemoved < MS_BUFFER_250) {
      this.hasPyromaniacProc = true;
    }
  }

  onHotStreakRemoved(event: RemoveBuffEvent) {
    this.hotStreakRemoved = event.timestamp;
    this.hasPyromaniacProc = false;
  }

  get wastedCritsPerMinute() {
    return this.wastedCrits / (this.owner.fightDuration / 60000);
  }

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCritsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.wastedCritsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You crit with {formatNumber(this.wastedCrits)} ({formatNumber(this.wastedCritsPerMinute)}{' '}
          Per Minute) direct damage abilities while <SpellLink id={SPELLS.HOT_STREAK.id} /> was
          active. This is a waste since those crits could have contibuted towards your next Hot
          Streak. Try to use your procs as soon as possible to avoid this.
        </>,
      )
        .icon(SPELLS.HOT_STREAK.icon)
        .actual(
          <Trans id="mage.fire.suggestions.hotStreak.wastedCrits">
            {formatNumber(this.wastedCrits)} crits wasted
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }
}

export default HotStreakWastedCrits;
