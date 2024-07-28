import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const MAX_BONE_SHIELD_STACKS = 15;
const BONE_SHIELD_DURATION_MS = 30 * 1000;
const DRW_COOLDOWN_REDUCTION_MS = 5000;
const BLOOD_TAP_COOLDOWN_REDUCTION_MS = 2000;
/**
 boneShieldTimesByStacks() returns an array with the durations of each BS charge
 */
class BoneShieldStacksBySeconds extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  // TODO:
  boneShieldStacks: number[][] = [];
  lastBoneShieldStack = 0;
  lastBoneShieldUpdate = this.owner.fight.start_time;
  boneShieldApplied = 0;

  totalDRWCooldownReduction = 0;
  totalDRWCooldownReductionWasted = 0;

  constructor(options: Options) {
    super(options);
    this.boneShieldStacks = Array.from({ length: MAX_BONE_SHIELD_STACKS + 1 }, (x) => []);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.MARROWREND_TALENT, TALENTS.DANCING_RUNE_WEAPON_TALENT]),
      this.trackApplication,
    );
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
  ) {
    this.boneShieldStacks[this.lastBoneShieldStack].push(
      event.timestamp - this.lastBoneShieldUpdate,
    );
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastBoneShieldUpdate = event.timestamp;
    const nextStacks = currentStacks(event);
    const didExpire = nextStacks === 0 ? this.didExpire(event) : false;
    if (nextStacks < this.lastBoneShieldStack && !didExpire) {
      this.reduceDRWCooldown(nextStacks - this.lastBoneShieldStack);
      this.reduceBloodTapCooldown(nextStacks - this.lastBoneShieldStack);
    }
    this.lastBoneShieldStack = currentStacks(event);
  }

  trackApplication(event: CastEvent) {
    // Can't track this with buff applied events in case the player
    // refreshes at 10 stacks.
    const isMarrow = event.ability.guid === TALENTS.MARROWREND_TALENT.id;
    const isDRW = event.ability.guid === TALENTS.DANCING_RUNE_WEAPON_TALENT.id;
    const drwAddsStacks = this.selectedCombatant.hasTalent(TALENTS.INSATIABLE_BLADE_TALENT);

    if (isMarrow || (isDRW && drwAddsStacks)) {
      this.boneShieldApplied = event.timestamp;
    }
  }

  didExpire(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
  ) {
    const sinceApplication = event.timestamp - this.boneShieldApplied;
    return sinceApplication >= BONE_SHIELD_DURATION_MS;
  }

  get boneShieldTimesByStacks() {
    return this.boneShieldStacks;
  }

  get averageBoneShieldStacks() {
    let avgStacks = 0;
    this.boneShieldStacks.forEach((durations, index) => {
      avgStacks += (durations.reduce((a, b) => a + b, 0) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  reduceDRWCooldown(stackDiff: number) {
    if (!this.selectedCombatant.hasTalent(TALENTS.INSATIABLE_BLADE_TALENT)) {
      return;
    }
    if (stackDiff >= 0) {
      return;
    }
    const reduction = -stackDiff * DRW_COOLDOWN_REDUCTION_MS;
    const reducedSpellID = TALENTS.DANCING_RUNE_WEAPON_TALENT.id;
    if (!this.spellUsable.isOnCooldown(reducedSpellID)) {
      this.totalDRWCooldownReductionWasted += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(reducedSpellID, reduction);
      this.totalDRWCooldownReduction += effectiveReduction;
      this.totalDRWCooldownReductionWasted += reduction - effectiveReduction;
    }
  }

  reduceBloodTapCooldown(stackDiff: number) {
    if (!this.selectedCombatant.hasTalent(TALENTS.BLOOD_TAP_TALENT)) {
      return;
    }
    if (stackDiff >= 0) {
      return;
    }
    const reduction = -stackDiff * BLOOD_TAP_COOLDOWN_REDUCTION_MS;
    const reducedSpellID = TALENTS.BLOOD_TAP_TALENT.id;
    if (this.spellUsable.isOnCooldown(reducedSpellID)) {
      this.spellUsable.reduceCooldown(reducedSpellID, reduction);
    }
  }
}

export default BoneShieldStacksBySeconds;
