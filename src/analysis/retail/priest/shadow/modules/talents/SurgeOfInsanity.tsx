import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  DamageEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

const BUFF_DURATION_MS = 30000;

class SurgeOfInsanity extends Analyzer {
  damage = 0;
  insanityGained = 0;
  casts = 0;
  ticks = 0;
  secondCast = false; //This is for finding the DP overcaped procs, as it is only every other DP cast that causes the buff
  lastCastHalo = false; //Was the most recent cause of a proc Halo

  procsGained = 0; //Total gained Procs(including refreshed)
  procsExpired = 0; //procs lost to time
  procsOver = 0; //procs lost to overwriting them

  lastProcTime = 0; //The time of the last proc occured (Gain buff, Gain Stack, or Refreshed Buff)
  lastCastTime = 0; //The Last time DP was cast that caused a Proc to Occur
  currentStacks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_MADNESS_TALENT),
      this.onCastDP,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HALO_SHADOW_TALENT),
      this.onCastHalo,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onCast,
    );
    //Buff
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF),
      this.onRemoveStack,
    );
  }

  //regardless of haste, a full channel of this spell ticks 4 times.
  get ticksWastedPercentage() {
    return 1 - this.ticks / (this.casts * 4);
  }
  get ticksWasted() {
    return this.casts * 4 - this.ticks;
  }
  get procsWasted() {
    return this.procsExpired + this.procsOver;
  }

  onCastHalo(event: ResourceChangeEvent) {
    //Archon Hero Talent Manifested Power causes halo to give Surge of Insanity
    //Every cast of halo causes 2 additional halos that do not have a cast event
    //So we use their resource generation event to track them.

    if (this.selectedCombatant.hasTalent(TALENTS.MANIFESTED_POWER_TALENT)) {
      //Halo Occurs before Buff change, so we don't have to check the timestamp
      if (this.currentStacks === 4) {
        this.procsGained += 1;
        this.procsOver += 1;
        this.lastProcTime = event.timestamp; //since the proc duration is refreshed when overwritten
      }
      this.lastCastHalo = true;
    }
  }

  onCastDP(event: CastEvent) {
    //DP cast occurs after the Buff is Applied but at (about) the same timestamp
    //If at 4 stacks and this DP isn't at the same time we reach 4 stacks, then it might be an overwritten proc
    //Since it is ever other DP that gives a stack of the buff, we check if this is a DP that gives a proc
    //This is only necesary because this buff does not have a refresh event.

    const compare: number = event.timestamp - this.lastCastTime; //The DP timestamp is slightly delayed compared to the proc.

    //If the currents Stacks are 4,
    //And if the Last Cast of DP that caused a Buff Event was not with 50 ms (meaning that it caused the buff stacks to increase)
    //And the current DP is the second cast which would cause the buff
    //Then we have wasted a Proc.

    if (this.currentStacks === 4 && compare >= 50 && this.secondCast) {
      this.procsGained += 1;
      this.procsOver += 1;
      this.lastProcTime = event.timestamp; //since the proc duration is refreshed when overwritten
    }

    //every cast of DP alternates between giving the proc and not giving the proc.

    if (this.secondCast === true) {
      this.secondCast = false;
    } else {
      this.secondCast = true;
    }
  }

  //Based on Frost DK Killing Machine.
  onBuff(event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;

    if (this.lastCastHalo === false) {
      //LastCastTime is only procs caused by DP.  If the last Cast was Halo, this proc was caused by Halo not DP
      this.lastCastTime = event.timestamp;
    }
    this.lastCastHalo = false;
  }

  onBuffStack(event: ApplyBuffStackEvent) {
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
    if (this.lastCastHalo === false) {
      //LastCastTime is only procs caused by DP.  If the last Cast was Halo, it was caused by Halo not DP.
      this.lastCastTime = event.timestamp;
    }
    this.lastCastHalo = false;
    this.currentStacks = event.stack;
  }

  onRemove(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS - 20) {
      this.procsExpired += this.currentStacks; //Since all stacks that are held are lost.
    }
    this.currentStacks = 0;
  }

  onRemoveStack(event: RemoveBuffStackEvent) {
    this.currentStacks = event.stack;
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    //TODO: Reduce this by what an unimpowered spell would give?
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>{this.ticksWasted} ticks wasted by cancelling the channel early.</>}
      >
        <BoringSpellValueText spell={SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF}>
          <>
            <div>
              <UptimeIcon /> {this.casts} <small>buffs used out of {this.procsGained} </small>{' '}
            </div>
            <div>
              <ItemDamageDone amount={this.damage} />{' '}
            </div>
            <div>
              <ItemInsanityGained amount={this.insanityGained} />
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodMFI = {
      count: this.ticks,
      label: 'Used Ticks',
    };

    const badMFI = {
      count: this.ticksWasted,
      label: 'Canceled Ticks',
    };

    const usedMFI = {
      count: this.casts,
      label: 'Buffs Used',
    };

    const overMFI = {
      count: this.procsOver,
      label: 'Buffs Overwritten',
    };

    const expiredMFI = {
      count: this.procsExpired,
      label: 'Buffs Expired',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.MIND_FLAY_INSANITY_TALENT_BUFF} />
        </b>{' '}
        is gained every two casts of <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT} />.<br />
        This buff can stack four times. Try to use these procs before overwriting them with
        devouring plague, unless you would otherwise overcap insanity.
      </p>
    );
    const data = (
      <div>
        <strong>Mind Flay Insanity Channels</strong>
        <GradiatedPerformanceBar good={goodMFI} bad={badMFI} />
        <strong>Mind Flay Insanity Procs</strong>
        <GradiatedPerformanceBar good={usedMFI} ok={overMFI} bad={expiredMFI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default SurgeOfInsanity;
