import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { KILL_SHOT_EXECUTE_RANGE, OVER_1_GCD_BUFFER } from 'parser/hunter/shared/constants';
import { formatDuration } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;

class KillShot extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  maxCasts: number = 0;
  inExecuteWindow: boolean = false;
  executeWindowStart: number = 0;
  lastExecuteHitTimestamp: number = 0;
  totalExecuteDuration: number = 0;

  constructor(options: any) {
    super(options);
    const combatant = this.selectedCombatant;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK), this.flayedShotProc);
    this.addEventListener(Events.fightend, this.onFightEnd);
    options.abilities.add({
      spell: SPELLS.KILL_SHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      charges: combatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id) ? 2 : 1,
      cooldown: () => {
        if (combatant.hasBuff(SPELLS.DEAD_EYE_BUFF.id)) {
          return 10 / 3 * 2;
        }
        return 10;
      },
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    if(this.isTargetInExecuteRange(event)) {
      this.lastExecuteHitTimestamp = event.timestamp;
      if(!this.inExecuteWindow) {
        this.inExecuteWindow = true;
        this.executeWindowStart = event.timestamp;
        debug && console.log("Execute window started");
      }
    } else {
      if(this.inExecuteWindow && event.timestamp > this.lastExecuteHitTimestamp + OVER_1_GCD_BUFFER) {
        this.inExecuteWindow = false;
        this.totalExecuteDuration += event.timestamp - this.executeWindowStart;
        debug && console.log("Execute window ended, current total: ", this.totalExecuteDuration);
      }
    }
  }

  flayedShotProc(event: ApplyBuffEvent) {
    this.maxCasts += 1;
    if(this.spellUsable.isOnCooldown(SPELLS.KILL_SHOT.id)) {
      this.spellUsable.endCooldown(SPELLS.KILL_SHOT.id, false, event.timestamp);
    }
  }

  onFightEnd(event: FightEndEvent) {
    if(this.inExecuteWindow) {
      this.totalExecuteDuration += event.timestamp - this.executeWindowStart;
      debug && console.log("Fight ended, total duration of execute: " + this.totalExecuteDuration + " | " + formatDuration(this.totalExecuteDuration));
    }
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 10000);
  }

  isTargetInExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return (event.hitPoints / event.maxHitPoints) < KILL_SHOT_EXECUTE_RANGE;
  }
}

export default KillShot;
