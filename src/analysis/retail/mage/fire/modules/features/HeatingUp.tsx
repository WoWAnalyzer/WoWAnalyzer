import { Trans } from '@lingui/macro';
import { FIRESTARTER_THRESHOLD, SEARING_TOUCH_THRESHOLD } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EventType, CastEvent, DamageEvent, HasTarget } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const debug = false;

class HeatingUp extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  hasFirestarter: boolean;
  hasSearingTouch: boolean;
  hasFlameOn: boolean;
  phoenixFlamesCastEvent?: CastEvent;
  fireBlastWithoutHeatingUp = 0;
  fireBlastWithHotStreak = 0;
  phoenixFlamesWithHotStreak = 0;
  healthPercent = 1;

  constructor(options: Options) {
    super(options);
    this.hasFirestarter = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
    this.hasSearingTouch = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.hasFlameOn = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES),
      this.onPhoenixFlamesDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BLAST),
      this.onFireBlastDamage,
    );
  }

  onPhoenixFlamesDamage(event: DamageEvent) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    const hasHotStreak = this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id);
    const hasHeatingUp = this.selectedCombatant.hasBuff(SPELLS.HEATING_UP.id);
    const phoenixFlamesCastEvent = this.eventHistory.last(
      1,
      500,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PHOENIX_FLAMES),
    )[0];
    if (!phoenixFlamesCastEvent || !HasTarget(phoenixFlamesCastEvent)) {
      return;
    }
    const castTarget = phoenixFlamesCastEvent
      ? encodeTargetString(phoenixFlamesCastEvent.targetID, event.targetInstance)
      : null;
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (event.hitPoints && event.maxHitPoints && event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
    if (castTarget !== damageTarget || hasHeatingUp) {
      return;
    }

    //If Combustion is active, the player is within the Firestarter execute window, or the player is in the Searing Touch execute window, then ignore the event
    //If the player had Hot Streak though, then its a mistake regardless
    if (
      !hasHotStreak &&
      (hasCombustion ||
        (this.hasFirestarter && this.healthPercent > FIRESTARTER_THRESHOLD) ||
        (this.hasSearingTouch && this.healthPercent < SEARING_TOUCH_THRESHOLD))
    ) {
      debug && this.log('Event Ignored');
      return;
    }

    //If the player cast Phoenix Flames with Hot Streak, then count it as a mistake
    if (hasHotStreak) {
      this.phoenixFlamesWithHotStreak += 1;
      debug && this.log('Phoenix Flames with Hot Streak');
    }
  }

  onFireBlastDamage(event: any) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    const hasHotStreak = this.selectedCombatant.hasBuff(SPELLS.HOT_STREAK.id);
    const hasHeatingUp = this.selectedCombatant.hasBuff(SPELLS.HEATING_UP.id);
    if (event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
    if (hasHeatingUp) {
      return;
    }

    //If the player is Venthyr and uses a Fire Blast without Heating Up during their Mirrors of Torment cast, that is acceptable
    const lastCast = this.eventHistory.last(1, 1000);
    if (
      lastCast.length > 0 &&
      lastCast[0].type === EventType.BeginCast &&
      lastCast[0].ability.guid === SPELLS.MIRRORS_OF_TORMENT.id
    ) {
      return;
    }

    //If Combustion is active, the player is within the Firestarter execute window, or the player is in the Searing Touch execute window, then ignore the event
    //If the player had Hot Streak though, then its a mistake regardless
    if (
      !hasHotStreak &&
      (hasCombustion ||
        (this.hasFirestarter && this.healthPercent > FIRESTARTER_THRESHOLD) ||
        (this.hasSearingTouch && this.healthPercent < SEARING_TOUCH_THRESHOLD))
    ) {
      debug && this.log('Event Ignored');
      return;
    }

    //If the player cast Fire Blast with Hot Streak or if they cast it without Heating Up, then count it as a mistake
    if (hasHotStreak) {
      this.fireBlastWithHotStreak += 1;
      debug && this.log('Fire Blast with Hot Streak');
    } else {
      this.fireBlastWithoutHeatingUp += 1;
      debug && this.log('Fire Blast without Heating Up');
    }
  }

  get fireBlastWasted() {
    return this.fireBlastWithoutHeatingUp + this.fireBlastWithHotStreak;
  }

  get totalWasted() {
    return this.fireBlastWasted + this.phoenixFlamesWithHotStreak;
  }

  get fireBlastUtil() {
    return 1 - this.fireBlastMissedPercent;
  }

  get phoenixFlamesUtil() {
    return 1 - this.phoenixFlamesMissedPercent;
  }

  get fireBlastMissedPercent() {
    return this.fireBlastWasted / this.abilityTracker.getAbility(SPELLS.FIRE_BLAST.id).casts;
  }

  get phoenixFlamesMissedPercent() {
    return (
      this.phoenixFlamesWithHotStreak /
      this.abilityTracker.getAbility(SPELLS.PHOENIX_FLAMES.id).casts
    );
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual: this.fireBlastUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get phoenixFlamesUtilSuggestionThresholds() {
    return {
      actual: this.phoenixFlamesUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.fireBlastUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.fireBlastWithHotStreak} times while{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> was active and {this.fireBlastWithoutHeatingUp}{' '}
          times while you didnt have <SpellLink id={SPELLS.HEATING_UP.id} />. Make sure that you are
          only using Fire Blast to convert Heating Up into Hot Streak or if you are going to cap on
          charges.
        </>,
      )
        .icon(SPELLS.FIRE_BLAST.icon)
        .actual(
          <Trans id="mage.fire.suggestions.heatingUp.fireBlastUtilization">
            {formatPercentage(this.fireBlastUtil)}% Utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
    when(this.phoenixFlamesUtilSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> {this.phoenixFlamesWithHotStreak}{' '}
          times while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste as the{' '}
          <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> could have contributed towards the next{' '}
          <SpellLink id={SPELLS.HEATING_UP.id} /> or <SpellLink id={SPELLS.HOT_STREAK.id} />.
        </>,
      )
        .icon(SPELLS.PHOENIX_FLAMES.icon)
        .actual(
          <Trans id="mage.fire.suggestions.heatingUp.phoenixFlames.utilization">
            {formatPercentage(this.phoenixFlamesUtil)}% Utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={
          <>
            Outside of Combustion & Firestarter, spells that are guaranteed to crit (like Fire
            Blast) should only be used to convert Heating Up into Hot Streak. While there are minor
            exceptions to this (like if you are about to cap on charges), the goal should be to
            waste as few of these as possible. Additionally, you should never cast Fire Blast or
            Phoenix Flames while Hot Streak is active, as those could have contributed towards your
            next Heating Up/Hot Streak
            <ul>
              <li>Fireblast used without Heating Up: {this.fireBlastWithoutHeatingUp}</li>
              <li>Fireblast used during Hot Streak: {this.fireBlastWithHotStreak}</li>
              <li>Phoenix Flames used during Hot Streak: {this.phoenixFlamesWithHotStreak}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HEATING_UP.id}>
          <>
            <SpellIcon id={SPELLS.FIRE_BLAST.id} /> {formatPercentage(this.fireBlastUtil, 0)}%{' '}
            <small>Fire Blast Utilization</small>
            <br />
            <SpellIcon id={SPELLS.PHOENIX_FLAMES.id} />{' '}
            {formatPercentage(this.phoenixFlamesUtil, 0)}% <small>Phoenix Flames Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HeatingUp;
