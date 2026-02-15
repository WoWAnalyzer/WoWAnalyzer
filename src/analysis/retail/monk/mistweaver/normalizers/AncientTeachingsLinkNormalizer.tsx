import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import {
  AnyEvent,
  DamageEvent,
  HealEvent,
  EventType,
  AddRelatedEvent,
  HasAbility,
} from 'parser/core/Events';
import { AT_MAX_TARGETS, getCurrentAncientTeachingsTransferCoefficient } from '../constants';
import { AT_TIGER_PALM, AT_BLACKOUT_KICK, AT_RSK, AT_JFS } from './EventLinks/EventLinkConstants';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';

/* TODO:
  * rwk - check for each individual rwk hit as it splits
  * cjl - there's a few nuances with cjl linking its cast seen in JadeEmpowerment module
    probably ignored _for now_ as both JE and JFT modules are working fine without this
  * jfs - once jfs is bug fixed to actually heal through AT, check if splits for each dmg instance or combined.
    should still be fine though?
*/

/*
 * ancient teachings healing is a % transfer of damage dealt, split on up to 5 injured players
 * quirks of combat logging for AT events consist of simultaneous damage events (e.g. bok cleaves from way of the crane)
 * that lead to batched heal events arriving in (sometimes) mismatched timestamps correlating to their
 * original damage source, making simple event links insufficient :(
 *
 * this normalizer implements a matching algo for attributing AT healing -> damage source:
 *   - group dmg events by timestamp and heal events into "batches" with a small tolerance
 *   - for a single dmg event (rsk, tiger palm): match to closest heal batch using weighted scoring
 *      - e.g: https://www.warcraftlogs.com/reports/FHjhXr6D3cbdx97Q/?fight=1&source=11&view=events&pins=2%24Separate%24%23244F4B%24casts%7Cdamage%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24100780%7C100784%7C107428%7C117952%7C100780%7C100784%7C228649%7C107428%7C185099%7C117952%24or%24healing%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24388024%7C388025&start=34789&end=40028
 *        - these are nearly 1-1 every time since batches have no competition
 *   - for multiple simultaneous damage events (bok + cleaves, cjl, rwk, jfs): match entire batch based on temporal proximity then distribute to dmg
 *      - sort dmgs by expected healing (largest first to avoid small dmg sapping larger heals and filling their "batch" entirely)
 *      - each dmg selects best matching heals from the pool
 *      - stop at 98% of expected healing to prevent greed
 *      - e.g: https://www.warcraftlogs.com/reports/FHjhXr6D3cbdx97Q/?fight=1&source=11&view=events&pins=2%24Separate%24%23244F4B%24casts%7Cdamage%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24100780%7C100784%7C107428%7C117952%7C100780%7C100784%7C228649%7C107428%7C185099%7C117952%24or%24healing%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24388024%7C388025&start=50866&end=54879
 */

const AT_HEAL_IDS = [SPELLS.AT_HEAL.id, SPELLS.AT_CRIT_HEAL.id];
const MAX_HEAL_DELAY = 300; // max delay between damage -> AT heal
const HEAL_BATCH_TOLERANCE = 5; // small tolerance to group AT heals into a batch
const HEAL_MATCH_TOLERANCE = 0.6; // 60% tolerance for matching - may be too high but several checks in place to prevent

interface DamageAbility {
  spellIds: number[];
  linkRelation: string;
}

const DAMAGE_ABILITIES: DamageAbility[] = [
  {
    spellIds: [SPELLS.TIGER_PALM.id],
    linkRelation: AT_TIGER_PALM,
  },
  {
    spellIds: [SPELLS.BLACKOUT_KICK.id, SPELLS.BLACKOUT_KICK_TOTM.id],
    linkRelation: AT_BLACKOUT_KICK,
  },
  {
    spellIds: [SPELLS.RISING_SUN_KICK_DAMAGE.id, SPELLS.RUSHING_WIND_KICK_DAMAGE.id],
    linkRelation: AT_RSK,
  },
  {
    spellIds: [SPELLS.JADEFIRE_STOMP_DAMAGE.id],
    linkRelation: AT_JFS,
  },
];

class AncientTeachingsLinkNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const damageEvents: DamageEvent[] = [];
    const healEvents: HealEvent[] = [];

    events.forEach((event) => {
      if (event.type === EventType.Damage && HasAbility(event)) {
        const ability = DAMAGE_ABILITIES.find((a) => a.spellIds.includes(event.ability.guid));
        if (ability && event.sourceID === this.selectedCombatant.id) {
          damageEvents.push(event as DamageEvent);
        }
      } else if (
        event.type === EventType.Heal &&
        HasAbility(event) &&
        AT_HEAL_IDS.includes(event.ability.guid) &&
        event.sourceID === this.selectedCombatant.id
      ) {
        healEvents.push(event as HealEvent);
      }
    });

    this.linkHealToDamage(damageEvents, healEvents);

    return events;
  }

  private linkHealToDamage(damageEvents: DamageEvent[], healEvents: HealEvent[]): void {
    damageEvents.sort((a, b) => a.timestamp - b.timestamp);
    healEvents.sort((a, b) => a.timestamp - b.timestamp);

    const healBatches = this.groupHealBatches(healEvents);
    const damageBatches = this.groupDamageBatches(damageEvents);
    const usedBatches = new Set<number>();

    const damageBatchMatches: Array<{
      damageBatch: DamageEvent[];
      batchIndex: number;
      batch: { timestamp: number; heals: HealEvent[] };
      timeDelta: number;
      score: number;
    }> = [];

    damageBatches.forEach((damageBatch) => {
      if (damageBatch.length === 1) {
        this.processSingleDamageEvent(damageBatch[0], healBatches, usedBatches);
      } else {
        this.findCandidateHealBatchesForDamageBatch(
          damageBatch,
          healBatches,
          usedBatches,
          damageBatchMatches,
        );
      }
    });

    // preferably get the temporally closest match over their "perceived" score
    damageBatchMatches.sort((a, b) => {
      if (a.timeDelta !== b.timeDelta) {
        return a.timeDelta - b.timeDelta;
      }
      return a.score - b.score;
    });
    damageBatchMatches.forEach((match) => {
      if (usedBatches.has(match.batchIndex)) {
        return;
      }
      usedBatches.add(match.batchIndex);
      this.processDamageBatchMatch(match.damageBatch, match.batch);
    });
  }

  private calculateATHealing(damage: DamageEvent): number {
    const totalDamage = effectiveDamage(damage);
    const coefficient = getCurrentAncientTeachingsTransferCoefficient(this.selectedCombatant);
    return totalDamage * coefficient;
  }

  private getBatchTotal(heals: HealEvent[]): number {
    return heals.reduce((sum, heal) => {
      return sum + effectiveHealing(heal) + (heal.overheal || 0);
    }, 0);
  }

  private getRelativeDifference(actual: number, expected: number): number {
    const difference = Math.abs(actual - expected);
    return difference / expected;
  }

  private isWithinTimeWindow(timeDelta: number): boolean {
    return timeDelta >= 0 && timeDelta <= MAX_HEAL_DELAY;
  }

  private getHealAmount(heal: HealEvent): number {
    return effectiveHealing(heal) + (heal.overheal || 0);
  }

  // single damage events are only tiger palm and rising sun kick (not rwk!)
  private processSingleDamageEvent(
    damage: DamageEvent,
    healBatches: Array<{ timestamp: number; heals: HealEvent[] }>,
    usedBatches: Set<number>,
  ): void {
    const calculatedHealing = this.calculateATHealing(damage);

    const candidateBatches: Array<{
      index: number;
      batch: { timestamp: number; heals: HealEvent[] };
      score: number;
      timeDelta: number;
    }> = [];

    healBatches.forEach((batch, batchIndex) => {
      if (usedBatches.has(batchIndex)) return;

      const timeDelta = batch.timestamp - damage.timestamp;
      if (!this.isWithinTimeWindow(timeDelta)) return;

      const batchTotal = this.getBatchTotal(batch.heals);
      const relativeDifference = this.getRelativeDifference(batchTotal, calculatedHealing);

      const timeScore = timeDelta / MAX_HEAL_DELAY;
      const amountScore = Math.min(relativeDifference, 1);

      // prioritize time > amount to circumvent weird matching to later AT events
      const score = amountScore * 0.4 + timeScore * 0.6;

      if (relativeDifference <= HEAL_MATCH_TOLERANCE) {
        candidateBatches.push({ index: batchIndex, batch, score, timeDelta });
      }
    });

    candidateBatches.sort((a, b) => {
      if (a.timeDelta < 100 && b.timeDelta >= 100) return -1;
      if (b.timeDelta < 100 && a.timeDelta >= 100) return 1;
      if (a.score !== b.score) return a.score - b.score;
      return a.batch.timestamp - b.batch.timestamp;
    });

    if (candidateBatches.length > 0) {
      const bestMatch = candidateBatches[0];
      usedBatches.add(bestMatch.index);
      this.linkDamageToHealBatch(damage, bestMatch.batch.heals);
    }
  }

  // damage batches are multiple simultaneous dmg events (bok cleaves, cjl, rwk, jfs)
  private findCandidateHealBatchesForDamageBatch(
    damageBatch: DamageEvent[],
    healBatches: Array<{ timestamp: number; heals: HealEvent[] }>,
    usedBatches: Set<number>,
    damageBatchMatches: Array<{
      damageBatch: DamageEvent[];
      batchIndex: number;
      batch: { timestamp: number; heals: HealEvent[] };
      timeDelta: number;
      score: number;
    }>,
  ): void {
    const totalCalculatedHealing = damageBatch.reduce(
      (sum, dmg) => sum + this.calculateATHealing(dmg),
      0,
    );

    healBatches.forEach((batch, batchIndex) => {
      if (usedBatches.has(batchIndex)) return;

      const timeDelta = batch.timestamp - damageBatch[0].timestamp;
      if (!this.isWithinTimeWindow(timeDelta)) return;

      const batchTotal = this.getBatchTotal(batch.heals);
      const relativeDifference = this.getRelativeDifference(batchTotal, totalCalculatedHealing);

      if (relativeDifference <= HEAL_MATCH_TOLERANCE) {
        const timeScore = timeDelta / MAX_HEAL_DELAY;
        const amountScore = Math.min(relativeDifference, 1);

        // prioritize amount > time since these events are near simultaneous annd
        // far more mismatched compared to single damage events
        const score = amountScore * 0.8 + timeScore * 0.2;

        damageBatchMatches.push({
          damageBatch,
          batchIndex,
          batch,
          timeDelta,
          score,
        });
      }
    });
  }

  private groupDamageBatches(events: DamageEvent[]): DamageEvent[][] {
    const batches: DamageEvent[][] = [];
    let currentBatch: DamageEvent[] = [];
    let currentTimestamp: number | null = null;

    events.forEach((event) => {
      if (currentTimestamp === null || event.timestamp === currentTimestamp) {
        currentBatch.push(event);
        currentTimestamp = event.timestamp;
      } else {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
        }
        currentBatch = [event];
        currentTimestamp = event.timestamp;
      }
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  private groupHealBatches(heals: HealEvent[]): Array<{ timestamp: number; heals: HealEvent[] }> {
    const batches: Array<{ timestamp: number; heals: HealEvent[] }> = [];
    let currentBatch: HealEvent[] = [];
    let batchTimestamp: number | null = null;

    heals.forEach((heal) => {
      if (batchTimestamp === null || heal.timestamp - batchTimestamp <= HEAL_BATCH_TOLERANCE) {
        currentBatch.push(heal);
        if (batchTimestamp === null) {
          batchTimestamp = heal.timestamp;
        }
      } else {
        if (currentBatch.length > 0) {
          batches.push({ timestamp: batchTimestamp, heals: currentBatch });
        }
        currentBatch = [heal];
        batchTimestamp = heal.timestamp;
      }
    });

    if (currentBatch.length > 0 && batchTimestamp !== null) {
      batches.push({ timestamp: batchTimestamp, heals: currentBatch });
    }

    return batches;
  }

  private processDamageBatchMatch(
    damageBatch: DamageEvent[],
    healBatch: { timestamp: number; heals: HealEvent[] },
  ): void {
    const healsWithAmounts = healBatch.heals.map((heal) => ({
      heal,
      amount: this.getHealAmount(heal),
    }));

    healsWithAmounts.sort((a, b) => b.amount - a.amount);

    const damagesWithCalculated = damageBatch.map((damage) => ({
      damage,
      calculatedTotal: this.calculateATHealing(damage),
    }));

    const damageAssignments = new Map<DamageEvent, HealEvent[]>();
    const usedHeals = new Set<HealEvent>();
    damageBatch.forEach((dmg) => damageAssignments.set(dmg, []));

    // largest first to avoid small dmg sapping larger heals and filling their "batch" entirely
    damagesWithCalculated.sort((a, b) => b.calculatedTotal - a.calculatedTotal);
    for (const { damage, calculatedTotal } of damagesWithCalculated) {
      const assignments: Array<{ heal: HealEvent; amount: number; delta: number }> = [];

      for (const { heal, amount } of healsWithAmounts) {
        if (usedHeals.has(heal)) continue;

        const delta = Math.abs(amount - calculatedTotal);
        assignments.push({ heal, amount, delta });
      }

      let assignedTotal = 0;
      const selectedHeals: Array<{ heal: HealEvent; amount: number }> = [];

      // trying to assign healing amounts to the calculated total and not being greedy in selections lol
      // this is desperately needed to avoid damage of higher values starving their smaller brethren
      // of their own matched AT healing
      assignments.sort((a, b) => a.delta - b.delta);
      for (const assignment of assignments) {
        if (selectedHeals.length >= AT_MAX_TARGETS) break;
        if (assignedTotal >= calculatedTotal * 0.98) break;

        selectedHeals.push(assignment);
        assignedTotal += assignment.amount;
      }

      for (const { heal } of selectedHeals) {
        damageAssignments.get(damage)!.push(heal);
        usedHeals.add(heal);
      }
    }

    damageBatch.forEach((damage) => {
      const heals = damageAssignments.get(damage) || [];
      if (heals.length > 0) {
        this.linkDamageToHealBatch(damage, heals);
      }
    });
  }

  private linkDamageToHealBatch(damageEvent: DamageEvent, heals: HealEvent[]): void {
    const ability = DAMAGE_ABILITIES.find((a) => a.spellIds.includes(damageEvent.ability.guid));
    if (!ability) return;

    const healsToLink = heals.slice(0, AT_MAX_TARGETS);
    healsToLink.forEach((healEvent) => {
      AddRelatedEvent(damageEvent, ability.linkRelation, healEvent);
    });
  }
}

export default AncientTeachingsLinkNormalizer;
