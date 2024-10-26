import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Combatants from 'parser/shared/modules/Combatants';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import { ABILITIES_THAT_TRIGGER_MASTERY } from '../../constants';

/**
 * THIS MODULE IS CALLED FOR SOME BACKGROUND STUFF
 * TODO - RESOLVE THOSE MODULES AND DELETE THIS ONE
 *
 * UNTIL THEN, JUST THE FRONT END IS DISABLED.
 */

const DEBUG = false;
const CUTOFF_PERCENT = 0.01;

interface EoLHealEvent extends HealEvent {
  eolCritAmount: number;
}

class EchoOfLightMastery extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    combatants: Combatants,
  };
  // All healing done by spells that can proc mastery
  masteryHealingBySpell: any = {};
  // The eol pools currently on a target
  targetMasteryPool: {
    [targetId: number]: {
      pendingHealingTotal: number;
      pendingHealingBySpell: {
        [spellId: number]: number;
      };
      remainingTicks: number;
      applicationTime: number;
      pendingCritTotal: number;
    };
  } = {};
  // The test value so we can see how accurate our EoL values are
  testValues = {
    effectiveHealing: 0,
    overhealing: 0,
    rawHealing: 0,
  };
  precastValues = {
    effectiveHealing: 0,
    overhealing: 0,
    rawHealing: 0,
  };
  protected abilityTracker!: AbilityTracker;
  protected healingDone!: HealingDone;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER), this.onRefreshBuff);
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbilityHealing(SPELLS.ECHO_OF_LIGHT_HEAL.id);
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.ECHO_OF_LIGHT_HEAL.id).healingVal.overheal;
  }

  get overHealingPercent() {
    return this.overHealing / this.rawHealing;
  }

  get rawHealing() {
    return this.effectiveHealing + this.overHealing;
  }

  get masteryTable() {
    const spellDetails = Object.keys(this.masteryHealingBySpell)
      .map((key) => ({
        spellId: key,
        ...this.masteryHealingBySpell[key],
      }))
      .sort((a, b) => b.effectiveHealing - a.effectiveHealing);

    const rows = [];

    for (let i = 0; i < spellDetails.length; i += 1) {
      if (DEBUG || this.getPercentOfTotalHealingBySpell(spellDetails[i].spellId) > CUTOFF_PERCENT) {
        rows.push(
          <tr key={'mastery_' + spellDetails[i].spellId}>
            <td>
              <SpellIcon spell={Number(spellDetails[i].spellId)} style={{ height: '2.4em' }} />
            </td>
            <td>{formatNumber(spellDetails[i].effectiveHealing)}</td>
            <td>
              {formatPercentage(this.getPercentOfTotalHealingBySpell(spellDetails[i].spellId))}%
            </td>
            <td>
              <TooltipElement content={`${formatNumber(spellDetails[i].overHealing)} Overhealing`}>
                {formatPercentage(this.getMasteryOverhealPercentBySpell(spellDetails[i].spellId))}%
              </TooltipElement>
            </td>
          </tr>,
        );
      }
    }

    if (DEBUG) {
      // Add precasted EoL
      rows.push(
        <tr key="mastery_precast">
          <td>Precast</td>
          <td>{formatNumber(this.precastValues.effectiveHealing)}</td>
          <td>
            {formatPercentage(
              this.precastValues.effectiveHealing / this.healingDone.total.effective,
            )}
            %
          </td>
          <td>
            <TooltipElement content={`${formatNumber(this.precastValues.overhealing)} Overhealing`}>
              {formatPercentage(this.precastValues.overhealing / this.precastValues.rawHealing)}%
            </TooltipElement>
          </td>
        </tr>,
      );
    }
    return rows;
  }

  getPercentOfTotalMasteryBySpell(spellId: number) {
    return this.masteryHealingBySpell[spellId].rawHealing / this.rawHealing;
  }

  getPercentOfTotalHealingBySpell(spellId: number) {
    return this.masteryHealingBySpell[spellId].effectiveHealing / this.healingDone.total.effective;
  }

  getMasteryOverhealPercentBySpell(spellId: number) {
    return (
      this.masteryHealingBySpell[spellId].overHealing /
      this.masteryHealingBySpell[spellId].rawHealing
    );
  }

  onHeal(event: EoLHealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ECHO_OF_LIGHT_HEAL.id) {
      this.handleEolTick(event);
    }
    if (ABILITIES_THAT_TRIGGER_MASTERY.includes(spellId)) {
      this.handleEolApplication(event);
    }
  }

  handleEolApplication(event: any) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (!this.targetMasteryPool[targetId]) {
      this.targetMasteryPool[targetId] = {
        remainingTicks: 0,
        applicationTime: 0,
        pendingHealingTotal: 0,
        pendingHealingBySpell: {},
        pendingCritTotal: 0,
      };
    }

    const rawHealing = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    this.targetMasteryPool[targetId].pendingHealingTotal += rawHealing;
    if (!this.targetMasteryPool[targetId].pendingHealingBySpell[spellId]) {
      this.targetMasteryPool[targetId].pendingHealingBySpell[spellId] = 0;
    }
    this.targetMasteryPool[targetId].pendingHealingBySpell[spellId] += rawHealing;
    if (event.hitType === HIT_TYPES.CRIT) {
      // Track how much of a EoL tick can be contributed to a crit.
      this.targetMasteryPool[targetId].pendingCritTotal += rawHealing / 2;
    }
  }

  handleEolTick(event: EoLHealEvent) {
    const targetId = event.targetID;

    // As far as I can tell, this happens when the combat log is out of order. You shouldn't receive a tick of EoL without a target having a buff apply event.
    if (!this.targetMasteryPool[targetId]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      DEBUG &&
        console.warn(
          `[${event.timestamp}] There was a mastery tick for ${
            event.amount + (event.absorbed || 0)
          } (${event.overheal || 0} OH) on target ${
            this.combatants.players[targetId] ? this.combatants.players[targetId].name : ''
          } (${targetId}) that doesn't have a mastery pool!`,
        );
      return;
    }

    if (this.targetMasteryPool[targetId].remainingTicks < 1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      DEBUG &&
        console.warn(
          `[${event.timestamp}] There was a mastery tick for ${
            event.amount + (event.absorbed || 0)
          } (${event.overheal || 0} OH) on target ${
            this.combatants.players[targetId] ? this.combatants.players[targetId].name : ''
          } (${targetId}) whos mastery pool is empty!`,
        );
      this.targetMasteryPool[targetId].remainingTicks = 1;
    }

    const tickEffectiveHealing = event.amount + (event.absorbed || 0);
    const tickOverhealing = event.overheal || 0;

    // The percentage of the total pool to be drained
    const poolDrainPercent = 1 / this.targetMasteryPool[targetId].remainingTicks;
    // The total amount that should be drained from the pool
    const poolDrainTotal = this.targetMasteryPool[targetId].pendingHealingTotal * poolDrainPercent;

    const rawCritValue =
      (this.targetMasteryPool[targetId].pendingCritTotal || 0) * poolDrainPercent;
    const effectiveCritValue = rawCritValue - tickOverhealing;
    this.targetMasteryPool[targetId].pendingCritTotal -= rawCritValue;

    if (effectiveCritValue > 0) {
      event.eolCritAmount = effectiveCritValue;
    }

    if (
      Object.keys(this.targetMasteryPool[targetId].pendingHealingBySpell).length === 0 &&
      this.targetMasteryPool[targetId].pendingHealingBySpell.constructor === Object
    ) {
      // This must be the result of a precasted EoL Application
      // There is no way to tell which spell caused this EoL, but we can store it for metrics!
      this.precastValues.effectiveHealing += tickEffectiveHealing;
      this.precastValues.overhealing += tickOverhealing;
      this.precastValues.rawHealing += tickEffectiveHealing + tickOverhealing;
      return;
    }
    Object.entries(this.targetMasteryPool[targetId].pendingHealingBySpell).forEach(
      ([spellId, amount]) => {
        // The percent of the pool that should be drained by this spell
        const tickHealingBySpell = amount * poolDrainPercent;
        const spellContributionPercent = tickHealingBySpell / poolDrainTotal;

        // Make sure the values are initialized
        if (!this.masteryHealingBySpell[spellId]) {
          this.masteryHealingBySpell[spellId] = {
            effectiveHealing: 0,
            overHealing: 0,
            rawHealing: 0,
          };
        }

        const effectiveHealing = tickEffectiveHealing * spellContributionPercent;
        const overHealing = tickOverhealing * spellContributionPercent;

        this.masteryHealingBySpell[spellId].effectiveHealing += effectiveHealing;
        this.masteryHealingBySpell[spellId].overHealing += overHealing;
        this.masteryHealingBySpell[spellId].rawHealing += effectiveHealing + overHealing;

        this.testValues.effectiveHealing += effectiveHealing;
        this.testValues.overhealing += overHealing;
        this.testValues.rawHealing += effectiveHealing + overHealing;
      },
    );

    this.targetMasteryPool[targetId].remainingTicks -= 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT_HEAL.id) {
      if (!this.targetMasteryPool[targetId]) {
        this.targetMasteryPool[targetId] = {
          applicationTime: 0,
          remainingTicks: 0,
          pendingHealingTotal: 0,
          pendingHealingBySpell: {},
          pendingCritTotal: 0,
        };
      }

      this.targetMasteryPool[targetId].remainingTicks = 2;
      this.targetMasteryPool[targetId].applicationTime = event.timestamp;
      this.targetMasteryPool[targetId].pendingCritTotal = 0;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT_HEAL.id) {
      // There is a bug when you apply and refresh EoL at the same exact millisecond.
      // When you do this (via benediction or some other means) there can be 4 ticks of EoL.
      // This code compensates for that.
      if (this.targetMasteryPool[targetId]) {
        if (event.timestamp === this.targetMasteryPool[targetId].applicationTime) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          DEBUG &&
            console.warn(
              `[${event.timestamp}] There was a double application of EoL tick on target ${
                this.combatants.players[targetId] ? this.combatants.players[targetId].name : ''
              } (${targetId}). Applying 4 ticks.`,
            );
          this.targetMasteryPool[targetId].remainingTicks = 4;
        } else {
          this.targetMasteryPool[targetId].remainingTicks = 3;
        }
      }
    }
  }
}

export default EchoOfLightMastery;
