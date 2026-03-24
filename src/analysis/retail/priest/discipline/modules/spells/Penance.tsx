import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import {
  PENANCE_BOLTS,
  PENANCE_CASTIGATION_ADDITIONAL_BOLTS,
  PENANCE_HARSH_DISIPLINE_ADDITIONAL_BOLTS_PER_RANK,
  PENANCE_TWINSIGHT_ADDITIONAL_BOLTS,
} from 'analysis/retail/priest/discipline/constants';
import { DisciplineEventLinks } from 'analysis/retail/priest/discipline/normalizers/EventLinkNormalizer';
import {
  isTwinsightPenanceBolt,
  PenanceBoltType,
  PenanceDamageEvent,
  PenanceHealEvent,
} from 'analysis/retail/priest/discipline/modules/spells/PenanceHelper';
import { SpellLink } from 'interface';
import type { JSX } from 'react';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const HARSH_DISCIPLINE_BUFFER_MS = 100;

export interface PenanceCast {
  event: CastEvent;
  expectedBolts: number;
  firedBolts: number;
  favourableTarget: boolean;
}

class Penance extends Analyzer {
  readonly baseBoltCount = PENANCE_BOLTS;
  readonly harshDisiplineRank: number;
  penanceCasts: PenanceCast[] = [];
  totalExpectedBolts = 0;
  totalFiredBolts = 0;
  firedBoltsPerType: number[] = [0, 0];
  hasTwinsight = false;

  constructor(options: Options) {
    super(options);

    this.harshDisiplineRank = this.selectedCombatant.getTalentRank(
      TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT,
    );
    this.hasTwinsight = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWINSIGHT_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.CASTIGATION_TALENT)) {
      this.baseBoltCount += PENANCE_CASTIGATION_ADDITIONAL_BOLTS;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST), this.onCast);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PENANCE_BOLT_DAMAGE, SPELLS.PENANCE_TWINSIGHT_BOLT_DAMAGE]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PENANCE_BOLT_HEAL, SPELLS.PENANCE_TWINSIGHT_BOLT_HEAL]),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    const hasHarshDisciplineBuff = this.selectedCombatant.hasBuff(
      SPELLS.HARSH_DISCIPLINE_BUFF,
      event.timestamp,
      HARSH_DISCIPLINE_BUFFER_MS,
    );
    const expectedBolts =
      this.baseBoltCount +
      (hasHarshDisciplineBuff
        ? PENANCE_HARSH_DISIPLINE_ADDITIONAL_BOLTS_PER_RANK[this.harshDisiplineRank]
        : 0) +
      (this.hasTwinsight ? PENANCE_TWINSIGHT_ADDITIONAL_BOLTS : 0);

    const firedBolts = GetRelatedEvents(event, DisciplineEventLinks.PENANCE_BOLT).length;

    this.penanceCasts[event.timestamp] = {
      event: event,
      expectedBolts: expectedBolts,
      firedBolts: firedBolts,
      favourableTarget:
        (this.hasTwinsight && event.targetIsFriendly) ||
        (!this.hasTwinsight && !event.targetIsFriendly),
    };

    this.totalExpectedBolts += expectedBolts;
    this.totalFiredBolts += firedBolts;
    this.firedBoltsPerType[PenanceBoltType.Normal] = 0;
    this.firedBoltsPerType[PenanceBoltType.Twinsight] = 0;
  }

  onDamage(event: PenanceDamageEvent) {
    event.penanceBoltType = isTwinsightPenanceBolt(event.ability.guid)
      ? PenanceBoltType.Twinsight
      : PenanceBoltType.Normal;

    this.firedBoltsPerType[event.penanceBoltType] += 1;
    event.penanceBoltNumber = this.firedBoltsPerType[event.penanceBoltType];
  }

  onHeal(event: PenanceHealEvent) {
    event.penanceBoltType = isTwinsightPenanceBolt(event.ability.guid)
      ? PenanceBoltType.Twinsight
      : PenanceBoltType.Normal;

    this.firedBoltsPerType[event.penanceBoltType] += 1;
    event.penanceBoltNumber = this.firedBoltsPerType[event.penanceBoltType];
  }

  getPenanceCast(event: CastEvent) {
    return this.penanceCasts[event.timestamp] ?? null;
  }

  getMissedBolts(): number {
    return this.totalExpectedBolts - this.totalFiredBolts;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.PENANCE_CAST} />{' '}
          </strong>
          has a large contribution to your through-put. Its important to finish channeling all its
          bolts.
        </p>

        {this.hasTwinsight && (
          <p>
            An <strong>Oracle</strong>'s <SpellLink spell={SPELLS.PENANCE_CAST} /> casts will be
            defensive in nature. Allowing for single target healing, and raid-wide healing through
            your <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} /> by the extra damage from the
            extra bolts fired by <SpellLink spell={TALENTS_PRIEST.TWINSIGHT_TALENT} />.
          </p>
        )}

        {!this.hasTwinsight && (
          <p>
            A <strong>Voidweaver</strong>'s <SpellLink spell={SPELLS.PENANCE_CAST} /> casts will be
            offensive in order to maximize throughput. You can still use it as a single target heal
            and to apply <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} />.
          </p>
        )}
      </>
    );
    const boxes = this.penanceCasts.map((penanceCast: PenanceCast): BoxRowEntry => {
      let value: QualitativePerformance;
      if (penanceCast.firedBolts >= penanceCast.expectedBolts) {
        if (penanceCast.favourableTarget) {
          value = QualitativePerformance.Perfect;
        } else {
          value = QualitativePerformance.Good;
        }
      } else {
        value = QualitativePerformance.Fail;
      }

      return {
        value,
        tooltip: (
          <>
            @ {this.owner.formatTimestamp(penanceCast.event.timestamp)}
            {this.hasTwinsight && !penanceCast.favourableTarget && (
              <p>Your target was not friendly.</p>
            )}
            {!this.hasTwinsight && !penanceCast.favourableTarget && (
              <p>Your target was friendly.</p>
            )}
            {value === QualitativePerformance.Fail && (
              <p>
                <strong>{penanceCast.firedBolts}</strong> out of{' '}
                <strong>{penanceCast.expectedBolts}</strong> bolts were fired.
              </p>
            )}
          </>
        ),
      };
    });

    const data = (
      <div>
        <SpellLink spell={SPELLS.PENANCE_CAST} />{' '}
        <small>
          - Blue indicates that all bolts were fired and your target was favorable. Green indicates
          your target was not favorable for your hero spec. Red means that you stopped channeling
          before all bolts were fired.
        </small>
        <PerformanceBoxRow values={boxes} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default Penance;
