import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Events, { ApplyBuffEvent, CastEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import {
  STORMSTRIKE_LINK,
  THORIMS_INVOCATION_LINK,
} from 'analysis/retail/shaman/enhancement/modules/normalizers/EventLinkNormalizer';
import { SpellLink } from 'interface';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

interface AscendanceUsage {
  event: CastEvent;
  start: number;
  end: number;
  casts: CastEvent[];
}

const ASCENDANCE_DURATION = 15000;
const DRE_DURATION = 6000;

class Ascendance extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected current: AscendanceUsage | null = null;
  protected entries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    // this can be active if either the Ascendance or Deeply Rooted Elements talents are chosen
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onApplyBuff,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onApplyBuff,
      );
    } else {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onCastAscendance,
      );
    }

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onEndAscendance,
    );
    this.addEventListener(Events.fightend, this.onEndAscendance);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCastAscendance(event: CastEvent) {
    this.current = {
      event: event,
      start: event.timestamp,
      end: event.timestamp + ASCENDANCE_DURATION,
      casts: [],
    };
  }

  onApplyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.ApplyBuff) {
      this.current = {
        event: {
          ...event,
          type: EventType.Cast,
          sourceID: event.sourceID!,
          __fabricated: true,
          __modified: true,
        },
        start: event.timestamp,
        end: event.timestamp + DRE_DURATION,
        casts: [],
      };
    } else if (this.current) {
      this.current.end = event.timestamp + DRE_DURATION;
    }
  }

  onCast(event: CastEvent) {
    if (!this.current) {
      return;
    }
    if (
      event._linkedEvents?.find(
        (le) => le.relation === STORMSTRIKE_LINK || le.relation === THORIMS_INVOCATION_LINK,
      )
    ) {
      this.current.casts.push(event);
    }
  }

  onEndAscendance() {
    this.recordPerformance(this.current);
    this.current = null;
  }

  recordPerformance(usage: AscendanceUsage | null) {
    const entry: BoxRowEntry = {
      value: QualitativePerformance.Fail,
    };
    this.entries.push(entry);
  }

  description() {
    return (
      <>
        <ExplanationSection>
          <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> is a powerful ability that is
          important to optimize
        </ExplanationSection>
      </>
    );
  }

  explainPerformance(cast: AscendanceUsage): SpellUse {
    return {
      event: cast.event,
      performance: QualitativePerformance.Perfect,
      performanceExplanation: 'Aim for 4 or more casts during ascendance',
      checklistItems: [
        {
          check: 'ascendance',
          performance: QualitativePerformance.Perfect,
          timestamp: cast.event.timestamp,
          summary: (
            <div>
              You did not have <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} />
            </div>
          ),
          details: (
            <div>
              You did not have <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} />. By itself,
              <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> and{' '}
              <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} />
              do not provide enough damage to be taken alone. If you pick either of these talents,
              you should <em>always</em> pick{' '}
              <SpellLink spell={TALENTS.STATIC_ACCUMULATION_TALENT} /> and
              <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} />
            </div>
          ),
        },
      ],
    };
  }
}

export default Ascendance;
