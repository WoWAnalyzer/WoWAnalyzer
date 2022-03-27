import legendaries from 'common/ITEMS/shadowlands/legendaries/deathknight';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const MAX_BONE_SHIELD_STACKS = 10;
const BONE_SHIELD_DURATION_MS = 30 * 1000;

/**
 boneShieldTimesByStacks() returns an array with the durations of each BS charge
 */
class BoneShieldStacksBySeconds extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  boneShieldStacks = [];
  lastBoneShieldStack = 0;
  lastBoneShieldUpdate = this.owner.fight.start_time;
  boneShieldApplied = 0;

  totalDRWCooldownReduction = 0;
  totalDRWCooldownReductionWasted = 0;

  constructor(...args) {
    super(...args);
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MARROWREND),
      this.trackApplication,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DANCING_RUNE_WEAPON),
      this.trackApplication,
    );
  }

  handleStacks(event) {
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
      // TODO: Blood Tap cdr
      this.reduceDRWCooldown(nextStacks - this.lastBoneShieldStack);
    }
    this.lastBoneShieldStack = currentStacks(event);
  }

  trackApplication(event) {
    // Can't track this with buff applied events in case the player
    // refreshes at 10 stacks.
    const isMarrow = event.ability.guid === SPELLS.MARROWREND.spellID;
    const isDRW = event.ability.guid === SPELLS.DANCING_RUNE_WEAPON.spellID;
    const hasCRW = this.selectedCombatant.hasLegendary(SPELLS.CRIMSON_RUNE_WEAPON);

    if (isMarrow || (isDRW && hasCRW)) {
      this.boneShieldApplied = event.timestamp;
    }
  }

  didExpire(event) {
    const sinceApplication = event.timestamp - this.boneShieldApplied;
    if (sinceApplication >= BONE_SHIELD_DURATION_MS) {
      return true;
    }
    return false;
  }

  get boneShieldTimesByStacks() {
    return this.boneShieldStacks;
  }

  get averageBoneShieldStacks() {
    let avgStacks = 0;
    this.boneShieldStacks.forEach((elem, index) => {
      avgStacks += (elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  reduceDRWCooldown(stackDiff) {
    if (!this.selectedCombatant.hasLegendary(SPELLS.CRIMSON_RUNE_WEAPON)) {
      return;
    }
    if (stackDiff >= 0) {
      return;
    }
    const COOLDOWN_REDUCTION_MS = 5000;
    const reduction = -stackDiff * COOLDOWN_REDUCTION_MS;
    const reducedSpellID = SPELLS.DANCING_RUNE_WEAPON.id;
    if (!this.spellUsable.isOnCooldown(reducedSpellID)) {
      this.totalDRWCooldownReductionWasted += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(reducedSpellID, reduction);
      this.totalDRWCooldownReduction += effectiveReduction;
      this.totalDRWCooldownReductionWasted += reduction - effectiveReduction;
    }
  }
}

export default BoneShieldStacksBySeconds;
