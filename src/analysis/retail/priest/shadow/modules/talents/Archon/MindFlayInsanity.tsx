import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
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

class MindFlayInsanity extends Analyzer {
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

  //Based on Frost DK Killing Machine.
  onBuff(event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
  }

  onBuffStack(event: ApplyBuffStackEvent) {
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
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
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        is gained every <SpellLink spell={TALENTS.HALO_SHADOW_TALENT} />.<br />
        This buff can stack four times. Try to use these procs before they are overwritten
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

export default MindFlayInsanity;
