import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Events, { ApplyBuffEvent, CastEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import {
  STORMSTRIKE_LINK,
  THORIMS_INVOCATION_LINK,
} from 'analysis/retail/shaman/enhancement/modules/normalizers/EventLinkNormalizer';
import { SpellLink } from 'interface';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';

interface AscendanceCooldownCast extends SpellCast {
  start: number;
  end: number;
  buffedCasts: CastEvent[];
}

const ASCENDANCE_DURATION = 15000;
const DRE_DURATION = 6000;

class Ascendance extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected currentCooldown: AscendanceCooldownCast | null = null;

  constructor(options: Options) {
    super({ spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT }, options);

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
    this.currentCooldown = {
      event: event,
      start: event.timestamp,
      end: event.timestamp + ASCENDANCE_DURATION,
      buffedCasts: [],
    };
  }

  onApplyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.ApplyBuff) {
      this.currentCooldown = {
        event: {
          ...event,
          type: EventType.Cast,
          sourceID: event.sourceID!,
          __fabricated: true,
          __modified: true,
        },
        start: event.timestamp,
        end: event.timestamp + DRE_DURATION,
        buffedCasts: [],
      };
    } else if (this.currentCooldown) {
      this.currentCooldown.end = event.timestamp + DRE_DURATION;
    }
  }

  onCast(event: CastEvent) {
    if (!this.currentCooldown) {
      return;
    }
    if (
      event._linkedEvents?.find(
        (le) => le.relation === STORMSTRIKE_LINK || le.relation === THORIMS_INVOCATION_LINK,
      )
    ) {
      this.currentCooldown.buffedCasts.push(event);
    }
  }

  onEndAscendance() {
    if (this.currentCooldown) {
      this.recordCooldown(this.currentCooldown);
    }
    this.currentCooldown = null;
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

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
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
