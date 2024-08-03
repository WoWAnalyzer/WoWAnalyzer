import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  BLOODTALONS_DAMAGE_BONUS,
  cdSpell,
  FB_SPELLS,
  FINISHERS,
  LIONS_STRENGTH_DAMAGE_BONUS,
} from 'analysis/retail/druid/feral/constants';
import { isFromHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const BUFFER_MS = 50;

const DEBUG = false;

/**
 * **Bloodtalons**
 * Spec Talent Tier 9
 *
 * When you use 3 different combo point-generating abilities within 4 sec,
 * the damage of your next 3 Rips or Ferocious Bites is increased by 25%.
 * --------------------------------
 * This module specifically tracks Ferocious Bite's benefit from Bloodtalons.
 * Rip benefits are handled in RipUptimeAndSnapshots.
 */
class Bloodtalons extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  /** True iff the player has the Apex Predator's Craving legendary */
  hasApex: boolean;

  /** Finishers buffed by BT */
  goodFinishers: number = 0;
  /** Finisher unbuffed by BT, but where you might not have been able to */
  acceptableFinishers: number = 0;
  /** Finisher unbuffed by BT when you should have been able to */
  badFinishers: number = 0;

  /** Bites cast with the Apex Predator's Craving buff */
  apexBites: number = 0;
  /** Bites cast by Convoke */
  convokeBites: number = 0;
  /** Hardcast bites during Berserk (and not buffed by APC) */
  berserkBites: number = 0;
  /** Hardcast bites that weren't buffed by APC or during Berserk */
  regBites: number = 0;

  /** Bites cast with the Apex Predator's Craving buff that were buffed with BT */
  apexBitesWithBt: number = 0;
  /** Bites cast by Convoke that were buffed with BT */
  convokeBitesWithBt: number = 0;
  /** Hardcast bites during Berserk (and not buffed by APC) that were buffed with BT */
  berserkBitesWithBt: number = 0;
  /** Hardcast bites that weren't buffed by APC that were buffed with BT */
  regBitesWithBt: number = 0;

  /** Rips cast */
  rips: number = 0;
  /** Rips cast that were buffed with BT */
  ripsWithBt: number = 0;

  /** Primal Wraths cast */
  primalWraths: number = 0;
  /** Primal Wraths cast that were buffed with BT */
  primalWrathsWithBt: number = 0;

  /**
   * Normally, every regular hardcast FB should be buffed by BT, but we allow the following exceptions:
   * * Player consumed BT on an Apex bite since the last finisher
   * * Player consumed BT on Convoke since the last finisher
   * * Player is Berserk/Incarn (might not be enough builders to proc BT due to crits)
   *
   * If none of these exceptions apply and the FB didn't benefit from BT, we increment this.
   */
  badBites: number = 0;
  /** Number of regular hardcast FB that either benefitted from BT or had an exception */
  correctBites: number = 0;
  /** If there has been an 'exception' case since the last finisher that makes it ok for
   * this finisher to be a Ferocious Bite unbuffed by BT */
  exceptionSinceLastFinisher: boolean = false;

  /** Total damage added by Bloodtalons  */
  btDamage: number = 0;
  /** The damage that could have been boosted by Bloodtalons, before the boost. */
  totalBoostableDamage: number = 0;
  /** The damage that was boosted by Bloodtalons, before the boost */
  baseBoostedDamage: number = 0;
  /** Set of target IDs whose last rip application had BT */
  targetsWithBtRip: Set<string> = new Set<string>();

  /** Timestamp of last ravage damage, to avoid double counting the cleave hits */
  lastRavageHitTimestamp: number | undefined = undefined;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);
    this.hasApex = this.selectedCombatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT);

    // for tallying casts
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisherCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_DRUID.RAVAGE_TALENT)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAVAGE_DOTC_CAT),
        this.onRavageDamage,
      );
    }

    // for counting damage (Primal Wrath direct damage does not benefit from BT, hence its omission)
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onBtDirect);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RIP), this.onBtFromRip);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RIP),
      this.onRipApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RIP),
      this.onRipApply,
    );

    DEBUG && this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    console.log(`Correct Bites:${this.correctBites} / Bad Bites:${this.badBites}`);
  }

  onFinisherCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.FEROCIOUS_BITE.id) {
      const fromApex =
        this.hasApex &&
        this.selectedCombatant.hasBuff(
          SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
          event.timestamp,
          BUFFER_MS,
        );
      const hasBt = this._hasBt(event);
      if (hasBt) {
        if (fromApex) {
          // consumed BT with an apex bite - this is an exception allowing real finisher to be missing BT
          this.exceptionSinceLastFinisher = true;
          this.apexBitesWithBt += 1;
          this.apexBites += 1;
          return; // apex bite isn't a 'real finisher' - don't want to reset exception tracker
        } else {
          // hardcast bite with BT
          this.correctBites += 1;
          if (this._isBerserkOrIncarn()) {
            this.berserkBitesWithBt += 1;
            this.berserkBites += 1;
          } else {
            this.regBitesWithBt += 1;
            this.regBites += 1;
          }
        }
        this.goodFinishers += 1;
      } else if (!fromApex) {
        // hardcast bite without BT - check if this is acceptable
        if (this.exceptionSinceLastFinisher || this._isBerserkOrIncarn()) {
          this.correctBites += 1;
          this.acceptableFinishers += 1;
        } else {
          this.badBites += 1;
          this.badFinishers += 1;
        }
        // also increment the correct counter
        if (this._isBerserkOrIncarn()) {
          this.berserkBites += 1;
        } else {
          this.regBites += 1;
        }
      } else {
        // apex bite without BT
        this.apexBites += 1;
        this.acceptableFinishers += 1;
      }
    } else if (event.ability.guid === SPELLS.RIP.id) {
      if (this._hasBt(event)) {
        this.ripsWithBt += 1;
        this.goodFinishers += 1;
      } else {
        this.badFinishers += 1;
      }
      this.rips += 1;
    } else if (event.ability.guid === TALENTS_DRUID.PRIMAL_WRATH_TALENT.id) {
      if (this._hasBt(event)) {
        this.primalWrathsWithBt += 1;
        this.goodFinishers += 1;
      } else {
        this.badFinishers += 1;
      }
      this.primalWraths += 1;
    }

    this.exceptionSinceLastFinisher = false;
  }

  onFbDamage(event: DamageEvent) {
    if (!isFromHardcast(event) && isConvoking(this.selectedCombatant)) {
      // convoke bite
      if (this._hasBt(event)) {
        // consumed BT with a convoke bite - this is an exception allowing real finisher to be missing BT
        this.convokeBitesWithBt += 1;
        this.exceptionSinceLastFinisher = true;
        this.goodFinishers += 1;
      } else {
        this.acceptableFinishers += 1;
      }
      this.convokeBites += 1;
    }
  }

  onRavageDamage(event: DamageEvent) {
    if (!this.lastRavageHitTimestamp || event.timestamp > this.lastRavageHitTimestamp + BUFFER_MS) {
      this.onFbDamage(event);
      this.lastRavageHitTimestamp = event.timestamp;
    }
  }

  onBtDirect(event: DamageEvent) {
    this._tallyBtDamage(event, this._hasBt(event));
  }

  onBtFromRip(event: DamageEvent) {
    this._tallyBtDamage(event, this.targetsWithBtRip.has(encodeEventTargetString(event) || ''));
  }

  _tallyBtDamage(event: DamageEvent, benefittedFromBt: boolean) {
    const totalDamage = event.amount + (event.absorbed || 0);
    let btAdd = 0;
    if (benefittedFromBt) {
      btAdd = calculateEffectiveDamage(event, BLOODTALONS_DAMAGE_BONUS);
      this.btDamage += btAdd;
    }
    const baseDamage = totalDamage - btAdd;
    this.totalBoostableDamage += baseDamage;
    benefittedFromBt && (this.baseBoostedDamage += baseDamage);
  }

  onRipApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const targetString = encodeEventTargetString(event) || '';
    if (this._hasBt(event)) {
      this.targetsWithBtRip.add(targetString);
    } else {
      this.targetsWithBtRip.delete(targetString);
    }
  }

  _hasBt(event: AnyEvent): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, event.timestamp, BUFFER_MS);
  }

  _isBerserkOrIncarn(): boolean {
    return (
      this.selectedCombatant.hasBuff(SPELLS.BERSERK_CAT.id) ||
      this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id)
    );
  }

  get totalBites() {
    return this.apexBites + this.convokeBites + this.berserkBites + this.regBites;
  }

  get bitesWithBt() {
    return (
      this.apexBitesWithBt + this.convokeBitesWithBt + this.berserkBitesWithBt + this.regBitesWithBt
    );
  }

  /** Percent of boostable damage that actually did benefit from BT */
  get percentBoosted() {
    return this.totalBoostableDamage === 0 ? 0 : this.baseBoostedDamage / this.totalBoostableDamage;
  }

  get bloodtalonsVsLionsStrengthText() {
    return (
      <>
        You applied Bloodtalons to <strong>{formatPercentage(this.percentBoosted, 1)}%</strong> of
        your finisher damage. Below{' '}
        {formatPercentage(LIONS_STRENGTH_DAMAGE_BONUS / BLOODTALONS_DAMAGE_BONUS, 0)}%,{' '}
        <SpellLink spell={TALENTS_DRUID.LIONS_STRENGTH_TALENT}>Bite Force</SpellLink> would have
        done more damage for you.
      </>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodFinishers = {
      count: this.goodFinishers,
      label: 'Bloodtalons Finishers',
    };
    const acceptableFinishers = {
      count: this.acceptableFinishers,
      label: 'Acceptable Unbuffed Finishers',
    };
    const badFinishers = {
      count: this.badFinishers,
      label: 'Unacceptable Unbuffed Finishers',
    };

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.BLOODTALONS_TALENT} />
        </strong>{' '}
        changes your builder priorities. Pooling energy will make it easier to use three builders
        within a short window. It's worth using a sub-optimal builder if doing so would generate a
        proc. Some mechanics (Convoke, Berserk, Apex) will give you finishers faster than you can
        generate new bloodtalons - in these cases it's ok to use unbuffed finishers.
      </p>
    );

    const data = (
      <div>
        <p>{this.bloodtalonsVsLionsStrengthText}</p>
        <strong>Bloodtalons use breakdown</strong>
        <small>
          {' '}
          - Green is Bloodtalons finishers, Yellow is acceptable unbuffed finishers, Red is
          unacceptable unbuffed finishers. Mouseover for more details.
        </small>
        <GradiatedPerformanceBar good={goodFinishers} ok={acceptableFinishers} bad={badFinishers} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const hasPw = this.selectedCombatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT);
    return (
      <Statistic
        tooltip={
          <>
            The main statistic tracks how many of your Ferocious Bite and Rip casts benefitted from
            Bloodtalons. Your Rips {hasPw && 'and Primal Wraths '}should always be buffed by
            Bloodtalons, but there are several reasons why it might be impractical to buff every
            Bite, including being unable to proc it to avoid overcapping CPs during Berserk, or
            having more Bites than procs due to Apex Predator's Craving or Convoke the Spirits.
            <br />
            <br />
            Buffed Bite breakdown by source:
            <ul>
              <li>
                Regular Hardcasts:{' '}
                <strong>
                  {this.regBitesWithBt} / {this.regBites}
                </strong>
              </li>
              <li>
                <SpellLink spell={cdSpell(this.selectedCombatant)} /> Hardcasts:{' '}
                <strong>
                  {this.berserkBitesWithBt} / {this.berserkBites}
                </strong>
              </li>
              {this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
                <li>
                  <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />:{' '}
                  <strong>
                    {this.convokeBitesWithBt} / {this.convokeBites}
                  </strong>
                </li>
              )}
              {this.hasApex && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT} />:{' '}
                  <strong>
                    {this.apexBitesWithBt} / {this.apexBites}
                  </strong>
                </li>
              )}
            </ul>
            <br />
            Damage added due to <SpellLink spell={TALENTS_DRUID.BLOODTALONS_TALENT} /> (opportunity
            cost not included):{' '}
            <strong>
              {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.btDamage))}%
            </strong>
            <br />
            <br />
            {this.bloodtalonsVsLionsStrengthText}
          </>
        }
        size="flexible"
        position={STATISTIC_ORDER.CORE(40)}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.BLOODTALONS_TALENT}>
          <>
            <SpellIcon spell={SPELLS.FEROCIOUS_BITE} /> {this.bitesWithBt} / {this.totalBites}{' '}
            <small>buffed</small>
            <br />
            <SpellIcon spell={SPELLS.RIP} /> {this.ripsWithBt} / {this.rips} <small>buffed</small>
            {hasPw && (
              <>
                <br />
                <SpellIcon spell={TALENTS_DRUID.PRIMAL_WRATH_TALENT} /> {this.primalWrathsWithBt} /{' '}
                {this.primalWraths} <small>buffed</small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodtalons;
