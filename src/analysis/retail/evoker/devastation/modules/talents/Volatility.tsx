import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

import { VOLATILITY_PROC_CHANCE } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

//import { formatDuration } from 'common/format';

/**
 *
 * Voltality is a talent that gives Pyre a chance to "refire" at a nearby targets.
 * This proc isn't given to us naturally by blizzard so this module aims to grab them.
 * The way this is implemented is that we track the natural casts of Pyres, and if they hit
 * more than one target it will be allowed to look for further Pyre damage events, that can
 * then be counted as Volatility procs.
 * We also have to take into account that Dragonrage fires out 3 Pyres.
 * Sometimes Pyres will hit secondary targets slightly later than the primary target, which we also have to account for.
 * Sometimes you are able to cast pyre two times before a single damage event has been logged.
 * This is also something we have to account for, by looking for an extra damage event before we start allowing
 * Volatility tracking.
 * This code is most likely overly complex, but it works as intended.
 *
 */

class Volatility extends Analyzer {
  damageFromPyre: number = 0;
  extraDamageFromVola: number = 0;
  volaProcs: number = 0;
  volaProc: boolean = false;
  pyreCastedTime: number = 0;
  currentPyreDamageEvent: number = 0;
  previousPyreDamageEvent: number = 0;
  dragonRageApplied: number = 0;
  pyreFromDragonrage: boolean = false;
  castedVolatilityProcChances: number = 0;
  volaVolatilityProcChances: number = 0;
  dragonrageVolatilityProcChances: number = 0;
  damageCounter: number = 0;
  amountToExpect: number = 0;
  expectExtraCast: boolean = false;
  pyreCasted: number = 0;
  volatiliyActualProcChance: number = 0;
  fightStartTime: number = 0;
  expectVolaProc: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOLATILITY_TALENT);
    const ranks = this.selectedCombatant.getTalentRank(TALENTS.VOLATILITY_TALENT);
    this.volatiliyActualProcChance = VOLATILITY_PROC_CHANCE * ranks;
    this.fightStartTime = this.owner.fight.start_time;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.DRAGONRAGE_TALENT),
      this.dragonRage,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYRE_DENSE_TALENT),
      this.onCast,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE), this.onHit);
  }

  dragonRage(event: ApplyBuffEvent) {
    this.dragonRageApplied = event.timestamp;
    this.pyreFromDragonrage = true;
    this.damageCounter = 0;
  }

  // Use this function to properly filter the damage / proc
  onHit(event: DamageEvent) {
    this.currentPyreDamageEvent = event.timestamp;

    // Pyre comes from Dragonrage
    if (this.previousPyreDamageEvent < this.dragonRageApplied) {
      this.previousPyreDamageEvent = this.currentPyreDamageEvent;
    } // Pyre comes from cast
    else if (
      (this.amountToExpect > 0 || !this.expectVolaProc) &&
      this.previousPyreDamageEvent < this.currentPyreDamageEvent
    ) {
      if (this.amountToExpect > 0) {
        this.amountToExpect -= 1;
      }
      this.previousPyreDamageEvent = this.currentPyreDamageEvent;
      this.damageCounter = 0;
    } // Pyre comes from Volatility proc
    else if (
      this.previousPyreDamageEvent < this.currentPyreDamageEvent &&
      this.amountToExpect === 0 &&
      this.expectVolaProc
    ) {
      this.previousPyreDamageEvent = this.currentPyreDamageEvent;
      this.pyreFromDragonrage = false;
      this.volaProc = true;
      this.volaProcs += 1;
      this.damageCounter = 0;
    }
    // DRAGONRAGE
    if (this.pyreFromDragonrage && this.previousPyreDamageEvent === this.currentPyreDamageEvent) {
      // track damage from DR idk yet just filter it away for now :))
      this.damageCounter += 1;
      if (this.damageCounter === 2) {
        this.dragonrageVolatilityProcChances += 2;
        this.expectVolaProc = true;
      }
      if (this.damageCounter === 3) {
        this.dragonrageVolatilityProcChances += 1;
      }
    }
    // END DRAGONRAGE
    // CASTED
    else if (!this.volaProc) {
      // Just tracking damage incase we wanna use it for something in the future
      this.damageFromPyre += event.amount;
      this.damageCounter += 1;
      if (this.damageCounter === 2) {
        if (this.expectExtraCast) {
          this.castedVolatilityProcChances += 2;
          this.expectExtraCast = false;
        } else {
          this.castedVolatilityProcChances += 1;
        }
        this.expectVolaProc = true;
      }
    }
    // END CASTED
    // VOLATILITY
    else if (this.volaProc) {
      this.extraDamageFromVola += event.amount + (event.absorbed ?? 0);
      this.damageCounter += 1;
      if (this.damageCounter === 2) {
        this.volaVolatilityProcChances += 1;
      }
    }
  }

  onCast(event: CastEvent) {
    this.pyreCastedTime = event.timestamp;
    this.volaProc = false;
    this.pyreFromDragonrage = false;
    this.amountToExpect += 1;
    this.pyreCasted += 1;
    if (this.amountToExpect === 2) {
      this.expectExtraCast = true;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>
              Procs: {Math.floor(this.volaProcs)}
              <br />
            </li>
            <li>
              Expected procs:{' '}
              {Math.floor(
                (this.castedVolatilityProcChances +
                  this.volaVolatilityProcChances +
                  this.dragonrageVolatilityProcChances) *
                  this.volatiliyActualProcChance,
              )}
            </li>
            <li>Damage: {formatNumber(this.extraDamageFromVola)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.VOLATILITY_TALENT}>
          <ItemDamageDone amount={this.extraDamageFromVola} />
        </TalentSpellText>
        {plotOneVariableBinomChart(
          this.volaProcs,
          this.castedVolatilityProcChances +
            this.volaVolatilityProcChances +
            this.dragonrageVolatilityProcChances,
          this.volatiliyActualProcChance,
        )}
      </Statistic>
    );
  }
}

export default Volatility;
