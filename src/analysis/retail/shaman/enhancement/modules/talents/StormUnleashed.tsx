import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { EnhancementEventLinks } from '../../constants';
import { SubSection } from 'interface/guide';
import BuffUptimeBar from 'interface/guide/components/BuffUptimeBar';

class StormUnleashed extends Analyzer {
  totalProcs = 0;
  wastedRefreshes = 0;
  wastedExpires = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.STORM_UNLEASHED_1_ENHANCEMENT_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_UNLEASHED_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.STORM_UNLEASHED_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_UNLEASHED_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.STORM_UNLEASHED_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_UNLEASHED_BUFF),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // For a stacking proc, ApplyBuff is the first stack.
    this.totalProcs += 1;
  }

  onRefreshBuff(_event: RefreshBuffEvent) {
    // A refresh implies the proc was already active and got overwritten.
    this.totalProcs += 1;
    this.wastedRefreshes += 1;
  }

  onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const linkedCast = GetRelatedEvent<CastEvent>(
      event,
      EnhancementEventLinks.STORM_UNLEASHED_LINK,
      (e) => e.type === EventType.Cast && e.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id,
    );

    if (!linkedCast) {
      this.wastedExpires += 1;
    }
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const fightStart = this.owner.fight.start_time;
    const fightEnd = this.owner.fight.end_time;
    const crashLightningBuffHistory = this.selectedCombatant.getBuffHistory(
      SPELLS.CRASH_LIGHTNING_BUFF.id,
    );
    const crashLightningMaxStacks = this.selectedCombatant.hasTalent(
      TALENTS.STORM_UNLEASHED_1_ENHANCEMENT_TALENT,
    )
      ? 3
      : 1;

    const explanation = (
      <>
        <p>
          <SpellLink spell={SPELLS.STORM_UNLEASHED_BUFF} /> allows you to cast{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> without triggering it's cooldown, and{' '}
          while <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> is already on cooldown.
        </p>
        <p>
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> is a significant damage source in
          single target, so it's important to avoid unnecessarily wasting potential casts by holding
          on to the <SpellLink spell={SPELLS.STORM_UNLEASHED_BUFF} /> proc for too long, and either
          letting it expire or be overwritten.
        </p>
      </>
    );

    const data = (
      <SubSection>
        <SubSection>
          You wasted <SpellLink spell={SPELLS.STORM_UNLEASHED_BUFF} /> procs:
          <ul>
            {this.wastedRefreshes > 0 && (
              <li>
                Overwritten while already active: <strong>{this.wastedRefreshes}</strong>
              </li>
            )}
            {this.wastedExpires > 0 && (
              <li>
                Expired unused: <strong>{this.wastedExpires}</strong>
              </li>
            )}
            {this.wastedRefreshes === 0 && this.wastedExpires === 0 && <li>No wasted procs</li>}
          </ul>
          <div style={{ marginTop: 8 }}>
            Total procs: <strong>{this.totalProcs}</strong>
          </div>
        </SubSection>
        <hr />
        <SubSection title={<SpellLink spell={SPELLS.CRASH_LIGHTNING_BUFF} />}>
          <p>
            The graph below shows your uptime and stack count of{' '}
            <SpellLink spell={SPELLS.CRASH_LIGHTNING_BUFF} />.
          </p>
          <BuffUptimeBar
            spell={SPELLS.CRASH_LIGHTNING_BUFF}
            buffHistory={crashLightningBuffHistory}
            startTime={fightStart}
            endTime={fightEnd}
            maxStacks={crashLightningMaxStacks}
          />
        </SubSection>
      </SubSection>
    );

    return (
      <ExplanationAndDataSubSection
        title={<SpellLink spell={SPELLS.STORM_UNLEASHED_BUFF} />}
        explanation={explanation}
        data={data}
      />
    );
  }
}

export default StormUnleashed;
