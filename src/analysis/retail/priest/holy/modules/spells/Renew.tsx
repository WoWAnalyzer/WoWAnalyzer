import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  GlobalCooldownEvent,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Haste from 'parser/shared/modules/Haste';
import {
  BENEDICTION_RENEW,
  BENEDICTION_RENEW_HEALS,
  LIGHTWELL_RENEW,
  LIGHTWELL_RENEW_HEALS,
  SALVATION_RENEW,
  SALVATION_RENEW_HEALS,
} from '../../normalizers/CastLinkNormalizer';

const MS_BUFFER = 100;

class Renew extends Analyzer {
  static dependencies = {
    distanceMoved: DistanceMoved,
    spellUsable: SpellUsable,
    haste: Haste,
  };
  totalRenewHealing = 0;
  totalRenewOverhealing = 0;
  totalRenewAbsorbs = 0;
  totalRenewTicks = 0;
  lastRenewCast: number = 0;
  renewsCast = 0;
  goodRenews = 0;
  // A list of the reasons that a renew is listed as "bad". I may expand upon this later in a card.
  badRenewReason = {
    betterspell: 0,
    stationary: 0,
  };
  totalRenewApplications = 0;
  otherSourcesAndCastRenews = 0;

  lastGCD: GlobalCooldownEvent | null = null;
  lastCast: CastEvent | null = null;
  protected distanceMoved!: DistanceMoved;
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;

  renewsFromRevitalizingPrayers = 0;
  revitalizingPrayersRenewFraction = 0.4;
  timestampOfLastPrayerCast = -1;
  timestampOfLastRenewApplication = -1;
  revitalizingPrayersRenewDurations = 0; //Amount of renews normalized to normal renew duration

  renewsFromBenediction = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRefreshBuff,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGCD);
  }

  get badRenews() {
    return this.renewsCast - this.goodRenews;
  }

  get badRenewThreshold() {
    return {
      actual: this.badRenews,
      isGreaterThan: {
        minor: (2 * this.owner.fightDuration) / 1000 / 60,
        average: (3 * this.owner.fightDuration) / 1000 / 60,
        major: (4 * this.owner.fightDuration) / 1000 / 60,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  healingFromRenew(applicationCount: number) {
    const averageHealingPerRenewApplication = this.totalRenewHealing / this.totalRenewApplications;
    return averageHealingPerRenewApplication * applicationCount;
  }

  overhealingFromRenew(applicationCount: number) {
    const averageOverHealingPerRenewApplication =
      this.totalRenewOverhealing / this.totalRenewApplications;
    return averageOverHealingPerRenewApplication * applicationCount;
  }

  absorptionFromRenew(applicationCount: number) {
    const averageAbsorptionPerRenewApplication =
      this.totalRenewAbsorbs / this.totalRenewApplications;
    return averageAbsorptionPerRenewApplication * applicationCount;
  }

  onHeal(event: HealEvent) {
    if (
      HasRelatedEvent(event, LIGHTWELL_RENEW_HEALS) ||
      HasRelatedEvent(event, SALVATION_RENEW_HEALS) ||
      HasRelatedEvent(event, BENEDICTION_RENEW_HEALS)
    ) {
      return;
    }

    this.totalRenewHealing += event.amount || 0;
    this.totalRenewOverhealing += event.overheal || 0;
    this.totalRenewAbsorbs += event.absorbed || 0;
    this.totalRenewTicks += 1;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (this.lastCast) {
      // If our last cast was a renew cast, validate that it was used well.
      this.validateRenew(event);
    }
    if (spellId === TALENTS.RENEW_TALENT.id) {
      this.renewsCast += 1;
      this.lastCast = event;
    }
  }

  onPrayerCast(event: HealEvent) {
    this.timestampOfLastPrayerCast = event.timestamp;
  }
  onApplyBuff(event: ApplyBuffEvent) {
    this.handleRenewApplication(event);
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.handleRenewApplication(event);
  }

  handleRenewApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (HasRelatedEvent(event, LIGHTWELL_RENEW) || HasRelatedEvent(event, SALVATION_RENEW)) {
      return;
    }

    if (HasRelatedEvent(event, BENEDICTION_RENEW)) {
      this.renewsFromBenediction += 1;
      return;
    }

    this.timestampOfLastRenewApplication = event.timestamp;
    if (this.timestampOfLastRenewApplication - this.timestampOfLastPrayerCast < MS_BUFFER) {
      this.revitalizingPrayersRenewDurations += this.revitalizingPrayersRenewFraction;
      this.totalRenewApplications += this.revitalizingPrayersRenewFraction;
      this.renewsFromRevitalizingPrayers += 1;
      return;
    }

    this.totalRenewApplications += 1;
    this.otherSourcesAndCastRenews += 1;
  }

  onGCD(event: GlobalCooldownEvent) {
    const spellId = event.ability.guid;
    if (spellId !== TALENTS.RENEW_TALENT.id) {
      return;
    }
    this.lastGCD = event;
  }

  // This function validates if a renew should have been cast at all.
  validateRenew(event: CastEvent) {
    this.lastRenewCast = event.timestamp;
    if (this.lastGCD && this.movedSinceCast(event)) {
      // We are moving, but do we have any other better instant cast spells?
      const sanctifyOnCooldown =
        this.selectedCombatant.hasTalent(TALENTS.HOLY_WORD_SANCTIFY_TALENT) &&
        this.spellUsable.isOnCooldown(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id);
      const serenityOnCooldown =
        this.selectedCombatant.hasTalent(TALENTS.HOLY_WORD_SERENITY_TALENT) &&
        this.spellUsable.isOnCooldown(TALENTS.HOLY_WORD_SERENITY_TALENT.id);
      const pomOnCooldown =
        this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_MENDING_TALENT) &&
        this.spellUsable.isOnCooldown(TALENTS.PRAYER_OF_MENDING_TALENT.id);

      if (sanctifyOnCooldown && serenityOnCooldown && pomOnCooldown) {
        this.goodRenews += 1;
      } else {
        this.badRenewReason.betterspell = (this.badRenewReason.betterspell || 0) + 1;
      }
    }
    this.badRenewReason.stationary = (this.badRenewReason.stationary || 0) + 1;

    // Reset the cast history
    this.lastGCD = null;
    this.lastCast = null;
  }

  movedSinceCast(event: CastEvent) {
    if (this.lastGCD == null) {
      return false;
    }
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    const timeSinceLastMovement = this.distanceMoved.timeSinceLastMovement();

    if (timeSinceLastMovement !== null && timeSinceLastMovement < timeSinceCast) {
      return true;
    }
    return false;
  }

  suggestions(when: When) {
    when(this.badRenewThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should cast <SpellLink spell={TALENTS.RENEW_TALENT} /> less.
        </>,
      )
        .icon(TALENTS.RENEW_TALENT.icon)
        .actual(
          <>
            You used Renew {this.badRenews} times when another spell would have been more
            productive. Renew is one of the least efficient spells Holy Priests have, and should
            only be cast when moving with no other instants available.
          </>,
        )
        .recommended(`Two or less per minute is recommended, except for movement heavy fights.`),
    );
  }
}

export default Renew;
