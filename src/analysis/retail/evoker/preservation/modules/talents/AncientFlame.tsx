import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { reduce } from 'vega-lite/build/src/encoding';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getAncientFlameSource } from '../../normalizers/EventLinking/helpers';

class AncientFlame extends Analyzer {
  consumptions: BoxRowEntry[] = [];
  lastApply: ApplyBuffEvent | null = null;
  consumeTimes: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_FLAME_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ANCIENT_FLAME_BUFF),
      this.onConsume,
    );
  }

  onRefresh(event: RefreshBuffEvent) {
    let tooltip = null;
    let value = QualitativePerformance.Good;
    const applyEvent = getAncientFlameSource(event) as CastEvent;
    // 1 stack after eb cast = they were at 2 so not a waste
    if (
      applyEvent.ability.guid === SPELLS.EMERALD_BLOSSOM_CAST.id &&
      this.selectedCombatant.getBuffStacks(SPELLS.ESSENCE_BURST_BUFF.id) === 1
    ) {
      tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS_EVOKER.ANCIENT_FLAME_TALENT} /> applied @{' '}
            {this.owner.formatTimestamp(applyEvent.timestamp ?? this.owner.fight.start_time)}
          </div>
          <div>
            You refreshed this buff by casting <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> but
            you were capped on{' '}
            <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> stacks, which
            makes this refresh not a misplay.
          </div>
        </>
      );
    } else {
      tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS_EVOKER.ANCIENT_FLAME_TALENT} /> applied @{' '}
            {this.owner.formatTimestamp(applyEvent.timestamp ?? this.owner.fight.start_time)}
          </div>
          <div>
            You wasted this buff by casting another <SpellLink spell={applyEvent.ability.guid} /> @{' '}
            {this.owner.formatTimestamp(event.timestamp)} before casting{' '}
            <SpellLink spell={SPELLS.LIVING_FLAME_CAST} />
          </div>
        </>
      );
      value = QualitativePerformance.Fail;
    }
    this.consumptions.push({ value, tooltip });
  }

  onConsume(event: RemoveBuffEvent) {
    const applyEvent = getAncientFlameSource(event);
    const tooltip = (
      <>
        <div>
          <SpellLink spell={TALENTS_EVOKER.ANCIENT_FLAME_TALENT} /> applied @{' '}
          {this.owner.formatTimestamp(applyEvent.timestamp ?? this.owner.fight.start_time)}
        </div>
        <div>Consumed @ {this.owner.formatTimestamp(event.timestamp)}</div>
      </>
    );
    const value = QualitativePerformance.Good;
    this.consumptions.push({ value, tooltip });
    const startTime =
      applyEvent === null || applyEvent === undefined
        ? this.owner.fight.start_time
        : event.timestamp - applyEvent.timestamp;
    this.consumeTimes.push(startTime);
  }

  get averageTimeToConsume() {
    return formatDuration(
      reduce(this.consumeTimes, (prev, cur) => prev + cur, 0) / this.consumeTimes.length,
    );
  }

  get guideSubsection(): JSX.Element {
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const explanation = (
      <p>
        When playing an <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> focused build, it is extremely
        important to weave in casts of <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> between casts
        of <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> in order to generate{' '}
        <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} />. Not utilizing this
        talent will reduce your HPS, DPS, and mana efficiency. It is okay to refresh the buff during
        times of high damage intake where casting <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} />{' '}
        multiple times in a row is needed to keep the raid alive or when you are capped on{' '}
        <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> stacks.
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>
              <SpellLink spell={TALENTS_EVOKER.ANCIENT_FLAME_TALENT} /> consumptions
            </strong>{' '}
            <small>
              {' '}
              - Green indicates a buff that was consumed, while red indicates a buff that was wasted
              by refreshing.
            </small>
            <PerformanceBoxRow values={this.consumptions} />
          </div>
          <div style={styleObj}>
            <small style={styleObjInner}>
              <SpellLink spell={TALENTS_EVOKER.ANCIENT_FLAME_TALENT} /> -{' '}
            </small>
            <strong>{this.averageTimeToConsume}s</strong> <small>avg time to consume buff</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default AncientFlame;
