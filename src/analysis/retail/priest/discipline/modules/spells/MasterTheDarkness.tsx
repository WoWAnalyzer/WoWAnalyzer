import SPELLS from 'common/SPELLS/priest';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type { JSX } from 'react';

/** Master the Darkness is the Discipline Apex Talent. Whenever you cast Mind Blast, your next
 * Power Word: Shield is upgraded into Void Shield. Additionally, whenever you cast Penance,
 * you have a 25% chance to upgrade Power Word: Shield into Void Shield. This always occurs
 * exactly once in four casts. You may hold up to two procs at a time.
 * This module tracks how many times you cast a spell which would proc the effect while you were
 * already at 2 stacks of the buff, causing a potential proc to be wasted.
 */

class MasterTheDarkness extends Analyzer {
  wastedPenanceCasts: CastEvent[] = [];
  totalPenanceCasts = 0;

  trackedSpells = [SPELLS.PENANCE_CAST, TALENTS.MIND_BLAST_TALENT];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT);

    if (this.active) {
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onCast);
    }
  }

  //TODO: Add Mind Blast tracking to wasted casts counter.
  //TODO: Implement deck system to track potential procs.

  onCast(event: CastEvent) {
    this.totalPenanceCasts++;
    if (this.selectedCombatant.getBuffStacks(SPELLS.MASTER_THE_DARKNESS_BUFF) == 2) {
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
            <SpellLink spell={TALENTS.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT} />
          </strong>{' '}
          gives your <SpellLink spell={SPELLS.PENANCE_CAST} /> a chance to upgrade your {''}
          <SpellLink spell={SPELLS.POWER_WORD_SHIELD} /> to <SpellLink spell={SPELLS.VOID_SHIELD} />
          . Casting Penance with two stacks of the buff available has the potential to waste a new
          proc.
        </p>
        <p>
          <strong>
            <SpellLink spell={TALENTS.MASTER_THE_DARKNESS_3_DISCIPLINE_TALENT} />
          </strong>{' '}
          also guarantees the upgrade will proc every time you cast{' '}
          <SpellLink spell={TALENTS.MIND_BLAST_TALENT} />. You should never cast Mind Blast with two
          stacks of the buff available.
        </p>
      </>
    );

    const boxes = this.wastedPenanceCasts.map((event) => ({
      //badSpell = (element),
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
          Wasted <SpellLink spell={TALENTS.MASTER_THE_DARKNESS_1_DISCIPLINE_TALENT} /> procs:
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
