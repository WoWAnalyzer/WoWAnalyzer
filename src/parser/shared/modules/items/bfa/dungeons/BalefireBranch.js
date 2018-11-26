import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { formatDuration } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

import Analyzer from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const ACTIVATION_COOLDOWN = 90; // seconds

const STACKS_START = 100;
const DURATION_TO_DECAY = 20; // seconds
const STACKS_LOST_PER_SEC = STACKS_START / DURATION_TO_DECAY;

// sum of finite linear sequence {0, 5, 10, ... 100} to find sum stacks if no damage taken
const EXPECTED_SUM_STACKS_PER_USE = (DURATION_TO_DECAY + 1) * STACKS_START * 0.5;

// to calculate size of intellect buff based on trinket's item level
const BASE_ITEM_LEVEL = 340;
const BASE_INTELLECT_PER_STACK = 12;

/**
 * Use: Kindle your soul, gaining [x] Intellect, which decays over 20 sec or when taking damage.
 * (1 Min, 30 Sec Cooldown)
 * 
 * When activated the buff starts at 100 stacks. Every 1 second 5 stacks are lost.
 * Taking damage removes stacks. It appears that taking larger hits removes more stacks.
 * Stacks are removed even if the damage is 100% absorbed.
 * 
 * The initial buff shows in the log (and changebuffstack fabricated events) as a "1 stack" buff.
 * The log shows the correct stack count once it has been lowered from that initial value.
 */
class BalefireBranch extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  applyCount = 0;
  currentStack = 0;
  totalUptime = 0;

  lastApply = null;
  lastChange = null;

  // used to find average stacks over whole fight. 1 second at 5 stacks and 2 seconds at 10 would be sumStacks = 25
  sumStacks = 0;

  // sumStacks value if the player had taken no damage.
  expectedSumStacks = 0;

  // scales with trinket's ilvl
  intellectPerStack = 0;
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.BALEFIRE_BRANCH.id);

    if (this.active) {
      const itemLevel = this.selectedCombatant.getItem(ITEMS.BALEFIRE_BRANCH.id).itemLevel;
      this.intellectPerStack = calculatePrimaryStat(BASE_ITEM_LEVEL, BASE_INTELLECT_PER_STACK, itemLevel);

      // remind the player to activate the trinket
      this.abilities.add({
        spell: SPELLS.BALEFIRE_BRANCH_SPELL,
        name: SPELLS.BALEFIRE_BRANCH_SPELL.name,
        buffSpellId: SPELLS.KINDLED_SOUL.id,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: ACTIVATION_COOLDOWN,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_toPlayer_applybuff(event) {
    if (SPELLS.KINDLED_SOUL.id !== event.ability.guid) {
      return;
    }
    this.stackChange(STACKS_START, event.timestamp);
    this.expectedSumStacks += EXPECTED_SUM_STACKS_PER_USE;
    this.applyCount += 1;
    this.lastApply = event.timestamp;

    // using the trinket doesn't trigger a cast event, so make our own
    this.eventEmitter.fabricateEvent({
      ...event,
      ability: {
        abilityIcon: SPELLS.BALEFIRE_BRANCH_SPELL.icon,
        guid: SPELLS.BALEFIRE_BRANCH_SPELL.id,
        name: SPELLS.BALEFIRE_BRANCH_SPELL.name,
      },
      type: 'cast',
    }, event);

    /**
     * This first applybuff event shows just 1 stack, but it's actually STACKS_START stacks.
     * Fabricate an event to let things like StatTracker know the accurate stack number.
     * (applybuffstack isn't listened for in this analyzer)
     */
    this.eventEmitter.fabricateEvent({
      ...event,
      stack: STACKS_START,
      type: 'applybuffstack',
    });
  }

  on_toPlayer_removebuffstack(event) {
    if (SPELLS.KINDLED_SOUL.id !== event.ability.guid) {
      return;
    }
    this.stackChange(event.stack, event.timestamp);
  }

  on_toPlayer_removebuff(event) {
    if (SPELLS.KINDLED_SOUL.id !== event.ability.guid) {
      return;
    }
    this.stackChange(0, event.timestamp);
    this.totalUptime += (event.timestamp - this.lastApply);
  }

  on_finished() {
    if (!this.lastChange || !this.currentStack) {
      return;
    }
    const now = this.owner.fight.end_time;
    this.stackChange(0, now);
    this.totalUptime += (now - this.lastApply);

    if ((this.lastApply + DURATION_TO_DECAY) > now) {
      // buff still active when fight ends, so revert some of the expectedSumStacks
      const remainingDuration = ((this.lastApply + DURATION_TO_DECAY) - now) / 1000;
      const wholeSeconds = Math.floor(remainingDuration);

      // sum of finite linear sequence for the 'whole seconds' part
      const stackSumFromWholeSeconds = wholeSeconds * STACKS_LOST_PER_SEC * (1 + wholeSeconds) * 0.5;
      const fractionOfSecond = remainingDuration - wholeSeconds;
      const stacksDuringFraction = (wholeSeconds + 1) * STACKS_LOST_PER_SEC;
      this.expectedSumStacks -= (stackSumFromWholeSeconds + (fractionOfSecond * stacksDuringFraction));
    }
  }

  stackChange(newStack, timestamp) {
    if (this.lastChange) {
      const timeAtLastStack = timestamp - this.lastChange;
      this.sumStacks += this.currentStack * timeAtLastStack / 1000;
    }
    this.currentStack = newStack;
    this.lastChange = timestamp;
  }

  get possibleUseCount() {
    return 1 + Math.floor(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
  }

  get averageIntellect() {
    return this.intellectPerStack * (this.sumStacks / (this.owner.fightDuration / 1000));
  }

  item() {
    const expectedIntellectWithoutDamage = this.intellectPerStack * (this.expectedSumStacks / (this.owner.fightDuration / 1000));
    return {
      item: ITEMS.BALEFIRE_BRANCH,
      result: (
        <dfn data-tip={`Activated <b>${this.applyCount}</b> time${this.applyCount === 1 ? '' : 's'} of a possible <b>${this.possibleUseCount}</b>.<br/>
          The buff was active for <b>${formatDuration(this.totalUptime / 1000)}</b>.<br/>
          Average intellect reduced by <b>${(expectedIntellectWithoutDamage - this.averageIntellect).toFixed(1)}</b> due to damage taken while the buff was active.`}>
          {this.averageIntellect.toFixed(1)} average intellect
        </dfn>
      ),
    };
  }
}

export default BalefireBranch;
