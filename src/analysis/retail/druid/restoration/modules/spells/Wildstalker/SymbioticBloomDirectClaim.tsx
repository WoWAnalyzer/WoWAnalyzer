import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Events, {
  HealEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import {
  isFromImplant,
  isFromTwinSprouts,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

export type SymBloomProvider = 'implant' | 'twin' | 'thriving';

const BASE_BLOOM_DURATION_MS = 6_000;
const RESILIENT_FLOURISHING_EXTRA_MS = 2_000;

interface TrackedBloomStack {
  targetId: number;
  provider: SymBloomProvider;
  start: number;
  end: number;
}

/**
 * Shared SymBloom queries for hero-tree nesting.
 * Implant / Twin / Thriving claim all SymBloom ticks, so amp modules skip those.
 * Mastery (and nested VC) goes to whoever owns the oldest still-active stack.
 */
export default class SymbioticBloomDirectClaim extends Analyzer {
  private readonly bloomDurationMs: number;
  private bloomStacks: TrackedBloomStack[] = [];

  constructor(options: Options) {
    super(options);
    this.active = true;
    this.bloomDurationMs =
      BASE_BLOOM_DURATION_MS +
      (this.selectedCombatant.hasTalent(TALENTS_DRUID.RESILIENT_FLOURISHING_TALENT)
        ? RESILIENT_FLOURISHING_EXTRA_MS
        : 0);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomRemove,
    );
  }

  /**
   * Fraction of this heal already counted as direct SymBloom healing in the hero tree (0–1).
   * SymBloom ticks are fully claimed (Implant + Twin + Thriving Growth). Other heals: 0.
   */
  getDirectClaimPortion(event: HealEvent): number {
    if (event.ability.guid !== SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id) {
      return 0;
    }
    return 1;
  }

  /**
   * True when this provider owns the oldest still-active SymBloom stack on the target
   * (that stack is what grants the mastery presence).
   */
  isMasteryOwner(provider: SymBloomProvider, targetId: number, timestamp: number): boolean {
    const oldest = this.getOldestActiveStack(targetId, timestamp);
    return oldest?.provider === provider;
  }

  private getOldestActiveStack(targetId: number, timestamp: number): TrackedBloomStack | undefined {
    let oldest: TrackedBloomStack | undefined;
    for (const bloom of this.bloomStacks) {
      if (bloom.targetId !== targetId || bloom.start > timestamp || timestamp >= bloom.end) {
        continue;
      }
      if (!oldest || bloom.start < oldest.start) {
        oldest = bloom;
      }
    }
    return oldest;
  }

  private onBloomApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    let provider: SymBloomProvider = 'thriving';
    if (isFromImplant(event)) {
      provider = 'implant';
    } else if (isFromTwinSprouts(event)) {
      provider = 'twin';
    }

    this.bloomStacks.push({
      targetId: event.targetID,
      provider,
      start: event.timestamp,
      end: event.timestamp + this.bloomDurationMs,
    });
  }

  private onBloomRemove(event: RemoveBuffEvent) {
    // Buff fully gone — drop any remaining tracked stacks for this target
    this.bloomStacks = this.bloomStacks.filter((bloom) => bloom.targetId !== event.targetID);
  }
}
