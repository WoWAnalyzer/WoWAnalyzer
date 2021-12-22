import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage, {
  calculateOverkillDamage,
} from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveDamageReduction from 'parser/core/calculateEffectiveDamageReduction';
import calculateEffectiveHealing, {
  calculateOverhealing,
} from 'parser/core/calculateEffectiveHealing';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const SELF_BUFF = 0.06;
const FRIEND_BUFF = 0.03;

/**
 * This is gonna be slightly over explained because im being extra but
 * The moral of the story is wasteland can provide 2 buffs
 * 1 that is only on the caster
 * 1 that is only not of the caster
 *
 * This means if two people cast a spell that procs this buff they can have both
 * Its easy enough to track for that so we are going to track for that and then
 * decompose the events to accurately gather the damage/healing this buffs both provided
 * and reduced
 *
 * I'm going to explain the process in each method so nobody can get lost
 *
 * Since healing is broken into 3 types,
 * amount, overheal, absorbed
 * We are going to say that any absorbed healing is effective healing so
 * amount = amount + absorbed
 * absorbed = 0
 * Then we can quickly and simply decompose this while also factoring in
 * overhealing without having to worry that we forgot a healing type
 *
 * Damage has the same issue so we will be doing the same thing.
 * Overkill is less of an issue with DPS but we will be sure to factor it in
 *
 * We will be leading the decomposition with the FRIEND buff first then use the self buff
 * IE (assumes no overheal/kill)
 * amount = 1000
 * friendBuff = 1000 / 1.03
 * amount = amount - friendBuff
 * selfBuff = amount / 1.06
 * amount = amount - selfBuff
 *
 * This module will show the self buff in the init statistic only
 * But in the tooltip it will have a breakdown of everything anyone could want
 */
class WastelandPropriety extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
  };

  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected damageTaken!: DamageTaken;

  // ***** start of self buff variables ***** //
  selfDamageDone: number = 0;
  selfHealingDone: number = 0;
  selfDamageTaken: number = 0;
  // ***** end of self buff variables ***** //

  // ***** start of friend buff variables ***** //
  friendDamageDone: number = 0;
  friendHealingDone: number = 0;
  friendDamageTaken: number = 0;
  // ***** end of friend buff variables ***** //

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasSoulbindTrait(SPELLS.WASTELAND_PROPRIETY.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.damageDoneEvent);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.healEvent);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTakenEvent);
  }

  damageDoneEvent(event: DamageEvent) {
    // Quick and early bail out if we don't have any buffs we care about
    if (!this.anyBuffs) {
      return;
    }

    // Just make a copy so we can freely and safely decompose the event without negative effects on the rest of the system
    const cloneEvent = Object.assign({}, event);
    cloneEvent.amount = cloneEvent.amount + (cloneEvent.absorbed || 0);
    cloneEvent.absorbed = 0;
    // MAKE SURE we have overkill
    cloneEvent.overkill = cloneEvent.overkill || 0;

    // Okay. If we have both buffs we need to decompose
    if (this.friendBuff) {
      this.friendDamageDone += this.decompose(event, FRIEND_BUFF, false);
    }

    if (this.selfBuff) {
      this.selfDamageDone += this.decompose(event, SELF_BUFF, false);
    }
  }

  healEvent(event: HealEvent) {
    // quick and early bail out if we don't have any buffs we care about
    if (!this.anyBuffs) {
      return;
    }

    // just make a copy so we can freely and safely decompose the event without negative effects on the rest of the system
    const cloneEvent = Object.assign({}, event);
    cloneEvent.amount = cloneEvent.amount + (cloneEvent.absorbed || 0);
    cloneEvent.absorbed = 0;
    cloneEvent.overheal = cloneEvent.overheal || 0;

    // Okay. If we have both buffs we need to decompose
    if (this.friendBuff) {
      this.friendHealingDone += this.decompose(event, FRIEND_BUFF, false);
    }

    if (this.selfBuff) {
      this.selfHealingDone += this.decompose(event, SELF_BUFF, false);
    }
  }

  damageTakenEvent(event: DamageEvent) {
    // quick and early bail out if we don't have any buffs we care about
    if (!this.anyBuffs) {
      return;
    }

    // just make a copy so we can freely and safely decompose the event without negative effects on the rest of the system
    const cloneEvent = Object.assign({}, event);
    cloneEvent.amount = cloneEvent.amount + (cloneEvent.absorbed || 0);
    cloneEvent.absorbed = 0;

    // Okay. If we have both buffs we need to decompose
    if (this.friendBuff) {
      this.friendDamageTaken += this.decompose(event, FRIEND_BUFF, true);
    }

    if (this.selfBuff) {
      this.selfDamageTaken += this.decompose(event, SELF_BUFF, true);
    }
  }

  /**
   * This method will decompose the event that is passed in but return the amount it was EFFECTIVELY
   * boosted by
   *
   * @param event Damage or healing event to decompse
   * @param boostAmount the amount to decompose by
   * @param to if the event is happening to the player or not
   * @returns the effective amount it was boosted by
   */
  decompose(event: DamageEvent | HealEvent, boostAmount: number, to: boolean): number {
    // I could make this smarter and do checking for certain paramaters of the event
    // but since im lazy we will just provide more paramters to the method :)
    let effectiveAmount = 0;
    const typeDamage = event.type === EventType.Damage;
    const typeHealing = event.type === EventType.Heal;

    // first we will handle damage events the player causes
    if (typeDamage && !to) {
      effectiveAmount = calculateEffectiveDamage(event, boostAmount);
      const effectiveOverkill = calculateOverkillDamage(event, boostAmount);

      event.amount -= effectiveAmount;
      event.overkill! -= effectiveOverkill;
    }
    // now we handle damage events that happen to the player
    // yeah we are not normalizing for damage taken. Damage taken isn't real
    else if (typeDamage && to) {
      effectiveAmount = calculateEffectiveDamageReduction(event, boostAmount);
    }
    // now we handle healing events by the player
    else if (typeHealing && !to) {
      effectiveAmount = calculateEffectiveHealing(event, boostAmount);
      const effectiveOverheal = calculateOverhealing(event, boostAmount);

      event.amount -= effectiveAmount;
      event.overheal! -= effectiveOverheal;
    }

    return effectiveAmount;
  }

  get anyBuffs(): boolean {
    return this.friendBuff || this.selfBuff;
  }

  get selfBuff(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.WASTELAND_PROPRIETY_SELF_BUFF.id);
  }

  get friendBuff(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.WASTELAND_PROPRIETY_FRIEND_BUFF.id);
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    const damageDone = this.selfDamageDone;
    const healingDone = this.selfHealingDone;
    const damageReduced = this.selfDamageTaken;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The friend buff isn't what your friends do with the 3% buff <br />
            you provide but rather what you did with the 3% buff they <br />
            provided you. <br />
            <br />
            6% Self Buff - <br />
            <img src="/img/sword.png" alt="Damage" className="icon" />
            {` ${formatNumber((damageDone / fightDuration) * 1000)} DPS`}
            <br />
            <img src="/img/healing.png" alt="Healing" className="icon" />
            {` ${formatNumber((healingDone / fightDuration) * 1000)} HPS`}
            <br />
            <img src="/img/shield.png" alt="Damage Taken" className="icon" />
            {` ${formatNumber((damageReduced / fightDuration) * 1000)} DRPS`}
            <br />
            <br />
            3% Friend Buff - <br />
            <img src="/img/sword.png" alt="Damage" className="icon" />
            {` ${formatNumber((this.friendDamageDone / fightDuration) * 1000)} DPS`}
            <br />
            <img src="/img/healing.png" alt="Healing" className="icon" />
            {` ${formatNumber((this.friendHealingDone / fightDuration) * 1000)} HPS`}
            <br />
            <img src="/img/shield.png" alt="Damage Taken" className="icon" />
            {` ${formatNumber((this.friendDamageTaken / fightDuration) * 1000)} DRPS`}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.WASTELAND_PROPRIETY_SELF_BUFF.id}>
          <img src="/img/sword.png" alt="Damage" className="icon" />
          {` ${formatNumber((damageDone / fightDuration) * 1000)} DPS`}
          <br />
          <img src="/img/healing.png" alt="Healing" className="icon" />
          {` ${formatNumber((healingDone / fightDuration) * 1000)} HPS`}
          <br />
          <img src="/img/shield.png" alt="Damage Taken" className="icon" />
          {` ${formatNumber((damageReduced / fightDuration) * 1000)} DRPS`}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WastelandPropriety;
