import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type { JSX } from 'react';

class MasterTheDarkness extends Analyzer {
  wastedPenanceCasts: CastEvent[] = [];
  totalPenanceCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT,
    );

    if (this.active) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST),
        this.onCast,
      );
    }
  }

  onCast(event: CastEvent) {
    this.totalPenanceCasts++;
    if (this.selectedCombatant.hasBuff(SPELLS.MASTER_THE_DARKNESS_BUFF)) {
      this.wastedPenanceCasts.push(event);
    }
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active || this.totalPenanceCasts === 0) {
      return null;
    }

    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_PRIEST.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT} />
          </strong>{' '}
          gives your <SpellLink spell={SPELLS.PENANCE_CAST} /> a chance to upgrade your {''}
          <SpellLink spell={SPELLS.POWER_WORD_SHIELD} /> to <SpellLink spell={SPELLS.VOID_SHIELD} />
          . Casting Penance while the upgrade is already active wastes a potential new proc.
        </p>
      </>
    );

    const boxes = this.wastedPenanceCasts.map((event) => ({
      value: QualitativePerformance.Fail,
      tooltip: (
        <>
          {this.owner.formatTimestamp(event.timestamp)}: <SpellLink spell={SPELLS.PENANCE_CAST} />
          {''}
          cast while <SpellLink spell={SPELLS.MASTER_THE_DARKNESS_BUFF} /> was already active.
        </>
      ),
    }));

    const data = (
      <div>
        <p>
          Wasted <SpellLink spell={TALENTS_PRIEST.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT} /> procs:
          {''}
          <strong>{this.wastedPenanceCasts.length}</strong>
        </p>
        {this.wastedPenanceCasts.length > 0 ? (
          <PerformanceBoxRow values={boxes} />
        ) : (
          <p>Well done, no potential procs were missed!</p>
        )}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default MasterTheDarkness;
